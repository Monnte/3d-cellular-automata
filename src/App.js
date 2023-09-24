import React, { useState } from 'react';
import { Container, Row, Col, Button, FormCheck, Modal, FormGroup } from 'react-bootstrap';
import * as THREE from "three";
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stats } from '@react-three/drei'
import Form from 'react-bootstrap/Form';
import { CelluarAutomata } from './CelullularAutomat';
import { GridBox } from './renderFunctions';

import useCapture from "use-capture";

const isNumber = require('is-number');

function App() {
  const [gridSize, setGridSize] = useState(50);
  const [editMode, setEditMode] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  const [rule, setRule] = useState('');
  const [currentRule, setCurrentRule] = useState('0-6/1,3/2/N');

  const regexRuleValidator = new RegExp(/^[0-9,-]+\/[0-9,-]+\/[0-9]+\/[M,N]+$/);

  const [seeds, setSeeds] = useState([[25, 25, 25]]);

  const [toStayAlive, setToStayAlive] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [toGetAlive, setToGetAlive] = useState([1, 3]);
  const [maxState, setMaxState] = useState(1);
  const [neighbourhood, setNeighbourhood] = useState('N');

  const [showBoundingBox, setShowBoundingBox] = useState(true);

  const [xSeed, setXSeed] = useState('');
  const [ySeed, setYSeed] = useState('');
  const [zSeed, setZSeed] = useState('');

  const [backgroundColor, setBackgroundColor] = useState(new THREE.Color(0x000000));

  const [colorMode, setColorMode] = useState('rgb');
  const [stateColors, setStateColors] = useState([]);

  const [autoRotateCamera, setAutoRotateCamera] = useState(true);
  const [autoRotateSpeed, setAutoRotateSpeed] = useState(2);

  const [bind, startRecording] = useCapture({ duration: 5, fps: 60, filename: '3d-cellular-automata' });

  const isValidNumberInGrid = (number) => {
    if (number === '') return false;
    if (!isNumber(number)) return false;
    if (isNaN(number)) return false;
    return number >= 0 && number < gridSize;
  }

  const ruleOptionsAreValid = () => {
    if (toStayAlive.length === 0) return false;
    if (toGetAlive.length === 0) return false;
    if (maxState === 0) return false;
    if (neighbourhood === '' || neighbourhood === undefined || (neighbourhood !== 'M' && neighbourhood !== 'N')) return false;
    return true;
  }

  const parseAliveFromRule = (string) => {
    const numbers = string.split(',').map((item) => {
      if (item.includes('-')) {
        const range = item.split('-');
        const start = Number(range[0]);
        const end = Number(range[1]);
        const array = [];
        for (let i = start; i <= end; i++) {
          array.push(i);
        }
        return array;
      }
      return Number(item);
    });
    return numbers.flat();
  }

  const [showModal, setShowModal] = useState(false);
  const handleClose = () => setShowModal(false);

  return (
    <div className="App">
      <Modal show={showModal} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Capture video</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Move the camera to the position you want and then click on <b>Capture video</b> button, simulation will automatically start from accual state.</p>
          <p>Video will be automatically downloaded after it is captured.</p>
          <p>It can take some time to capture video, so please be patient.</p>
          <br />
          <p><b>Video will be 5 seconds long and at 60 FPS.</b></p>
          <h5>Recommendation:</h5>
          <p>While capturing video, please do not rather make any changes to the simulation.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="success"
            onClick={() => { setShowModal(false); setEditMode(false); setIsRunning(true); startRecording(); }}
          >
            Capture video
          </Button>
        </Modal.Footer>
      </Modal>


      <Container fluid>
        <Row className="vh-100" style={{ maxHeight: '100vh' }} >
          <Col xs={12} md={8} lg={8} xl={8} className="p-0 m-0">
            <Canvas camera={{ position: [50, 15, 50], rotation: [0, 25, 0] }} gl={{ preserveDrawingBuffer: true }} onCreated={bind} >
              <OrbitControls
                enablePan={false}
                autoRotate={autoRotateCamera}
                autoRotateSpeed={autoRotateSpeed}
              />
              <ambientLight />
              <pointLight position={[25, 25, 25]} intensity={29} />
              {showBoundingBox && <GridBox gridSize={gridSize} boxGeometry={boxGeometry} />}
              <CelluarAutomata
                gridSize={gridSize}
                seeds={seeds}
                isRunning={editMode ? false : isRunning}
                maxState={maxState}
                toStayAlive={toStayAlive}
                toGetAlive={toGetAlive}
                neighbourhood={neighbourhood}
                colorMode={colorMode}
                stateColors={stateColors}
              />
              {/* <Stats /> */}
              <color attach="background" args={[backgroundColor]} />
            </Canvas>
          </Col>

          <Col xs={12} md={4} lg={4} xl={4} className="bg-primary-dark" style={{ overflowY: 'auto', maxHeight: '100vh' }}>
            <h1 style={{ textAlign: 'center', marginTop: '0.3em' }}>3D Cellular Automata</h1>
            <p style={{ textAlign: 'center' }}>Inspired by <a href="https://softologyblog.wordpress.com/2019/12/28/3d-cellular-automata-3/">Softology Blog 3D Cellular Automata</a></p>
            <div className="d-flex flex-row  align-items-center justify-content-center">
              <Button style={{ margin: '0 0.3em' }} disabled={(!isRunning && !ruleOptionsAreValid()) || editMode} onClick={() => setIsRunning(!isRunning)}>{isRunning ? 'Stop simulation' : 'Start simulation'}</Button>{' '}
              <Button
                style={{ margin: '0 0.3em' }}
                onClick={() => { setIsRunning(false); setSeeds((seeds) => [...seeds]); }}
                variant='danger'
                disabled={editMode}
              >
                Reset</Button>{' '}
              <Button
                style={{ margin: '0 0.3em' }}
                onClick={() => {
                  const canvas = document.getElementsByTagName('canvas')[0];
                  const image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
                  const link = document.createElement('a');
                  link.download = 'render.png';
                  link.href = image;
                  link.click();
                }}
                variant="success"
                disabled={editMode}
              >Download render</Button>{' '}
              <Button
                style={{ margin: '0 0.3em' }}
                onClick={() => {
                  setShowModal(true);
                }}
                variant="success"
                disabled={editMode || isRunning}
              >Capture video</Button>
            </div>
            <hr />
            <p>Hello! This is a application to try out 3D Cellular Automata. Feel free to try it out and play with it. You can set seeds, change rules and more, just check the edit mode checkbox.
              To capture perfect render, move the camera to the position you want and then click on download render button.
            </p>
            <p>Current rule: <b>{currentRule}</b></p>
            <hr />
            <h5>Settings</h5>
            <FormCheck type="checkbox" label="Edit mode" onChange={(e) => { setEditMode(e.target.checked); setIsRunning(false); setSeeds((seeds) => [...seeds]) }} defaultChecked={editMode} />
            <FormCheck type="checkbox" label="Show grid bounding box" onChange={(e) => { setShowBoundingBox(e.target.checked) }} defaultChecked={showBoundingBox} />
            <FormCheck type="checkbox" label="Auto rotate camera" onChange={(e) => { setAutoRotateCamera(e.target.checked) }} defaultChecked={autoRotateCamera} />
            {/* slider */}
            {autoRotateCamera &&
              <FormGroup>
                <Form.Label>Auto rotate speed</Form.Label>
                <Form.Control
                  type="range"
                  min={1}
                  max={10}
                  step={0.1}
                  value={autoRotateSpeed}
                  onChange={(e) => { setAutoRotateSpeed(e.target.value) }}
                />
              </FormGroup>
            }

            <h5 className="mt-2">Background color</h5>
            <Form.Control
              type="color"
              className="mt-2"
              onChange={(e) => {
                setBackgroundColor(new THREE.Color(e.target.value));
              }}
            />

            <h5 className="mt-2">Cell color variations</h5>
            <Form.Control
              as="select"
              className="mt-2"
              onChange={(e) => {
                setColorMode(e.target.value);
                if (e.target.value === 'state') {
                  setStateColors([...Array(maxState + 1)].map(() => '0xffffff'));
                }
                if (e.target.value === 'oneColor') {
                  setStateColors(['0xffffff']);
                }
              }}
              value={colorMode}
            >
              <option value="rgb">RGB</option>
              <option value="state">Cell state</option>
              <option value="oneColor">One color</option>
              <option value="random">Random</option>
            </Form.Control>

            {colorMode === 'state' && <div
              className="mt-2 d-flex flex-row justify-content-start align-items-start"
              style={{ flexWrap: 'wrap' }}
            >
              {[...Array(maxState + 1)].map((_, index) => {
                return (
                  <Form.Group key={index} style={{ marginRight: '10px', textAlign: 'center' }}>
                    <Form.Label style={{ marginBottom: 0 }}>S-{index}</Form.Label>
                    <Form.Control
                      type="color"
                      className="mt-2"
                      onChange={(e) => {
                        const newColors = [...stateColors];
                        newColors[index] = e.target.value.replace('#', '0x');
                        setStateColors(newColors);
                      }}
                      value={stateColors[index].replace('0x', '#')}
                      {...(index === 0 && { disabled: true })}
                    />
                  </Form.Group>
                );
              })}
            </div>}

            {colorMode === 'oneColor' && <div
              className="mt-2 d-flex flex-row justify-content-start align-items-start"
              style={{ flexWrap: 'wrap' }}
            >
              <Form.Group style={{ marginRight: '10px', textAlign: 'center' }}>
                <Form.Label style={{ marginBottom: 0 }}>Color</Form.Label>
                <Form.Control
                  type="color"
                  className="mt-2"
                  onChange={(e) => {
                    const newColors = [...stateColors];
                    newColors[0] = e.target.value.replace('#', '0x');
                    setStateColors(newColors);
                  }}
                  value={stateColors[0].replace('0x', '#')}
                />
              </Form.Group>
            </div>}


            <hr />
            {editMode && <div>
              <h5>Set Rule</h5>
              Rule explanation X/Y/Z/A where:
              <ul>
                <li>X - number of neighbours to stay alive</li>
                <li>Y - number of neighbours to get alive</li>
                <li>Z - number of states</li>
                <li>A - neighbourhood type (N - Moore, M - Von Neumann)</li>
              </ul>
              <Form.Control
                type="text"
                placeholder="e.g. 4/4/5/M"
                value={rule}
                onChange={(e) => {
                  setRule(e.target.value);
                }}
                style={{ marginBottom: '10px' }}
              />
              <Button
                disabled={!regexRuleValidator.test(rule)}
                onClick={() => {
                  setCurrentRule(rule);
                  const ruleArray = rule.split('/');
                  setToStayAlive(parseAliveFromRule(ruleArray[0]));
                  setToGetAlive(parseAliveFromRule(ruleArray[1]));
                  setMaxState(ruleArray[2] - 1);
                  setNeighbourhood(ruleArray[3]);
                }}
              >
                {regexRuleValidator.test(rule) ? 'Set Rule' : 'Invalid Rule'}
              </Button>
              <hr />
              <h5>Set seeds</h5>
              <p>Seeds are set by coordinates in grid. You can set seeds by uploading file with coordinates or by adding them manually.</p>
              <p>File format is x y z separated by space. Each seed is on new line.</p>
              <input type="file" id="file" name="file"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = function (e) {
                    const lines = e.target.result.split('\n');
                    const newSeeds = [];
                    lines.forEach(line => {
                      const numbers = line.split(' ');
                      if (numbers.length !== 3) return;
                      const x = Number(numbers[0]);
                      const y = Number(numbers[1]);
                      const z = Number(numbers[2]);
                      if (isNaN(x) || isNaN(y) || isNaN(z)) return;
                      if (x < 0 || x >= gridSize || y < 0 || y >= gridSize || z < 0 || z >= gridSize) return;
                      newSeeds.push([x, y, z]);
                    });
                    setSeeds(newSeeds);
                  }
                  reader.readAsText(file);
                }}
                style={{ marginBottom: '10px', border: '1px solid #ced4da', borderRadius: '.25rem', padding: '.375rem .75rem' }}
              />
              <p style={{ marginBottom: 0 }}>Coordinates must be in range 0 - {gridSize - 1}</p>
              <div className="d-flex flex-row justify-content-between align-items-center">
                <Form.Control
                  type="text"
                  placeholder="x"
                  className="mt-2"
                  style={{ marginRight: '10px' }}
                  onChange={(e) => {
                    setXSeed(e.target.value);
                  }}
                />
                <Form.Control
                  type="text"
                  placeholder="y"
                  className="mt-2"
                  style={{ marginRight: '10px' }}
                  onChange={(e) => {
                    setYSeed(e.target.value);
                  }}
                />
                <Form.Control
                  type="text"
                  placeholder="z"
                  className="mt-2"
                  onChange={(e) => {
                    setZSeed(e.target.value);
                  }}
                />
              </div>
              <Button
                className="mt-2"
                disabled={!isValidNumberInGrid(xSeed) || !isValidNumberInGrid(ySeed) || !isValidNumberInGrid(zSeed)}
                onClick={() => {
                  const newSeed = [Number(xSeed), Number(ySeed), Number(zSeed)];
                  if (seeds.find(seed => seed[0] === newSeed[0] && seed[1] === newSeed[1] && seed[2] === newSeed[2])) return;
                  setSeeds([...seeds, newSeed]);
                }}
              >Add seed</Button>{' '}
              <Button
                className="mt-2"
                disabled={!isValidNumberInGrid(xSeed) || !isValidNumberInGrid(ySeed) || !isValidNumberInGrid(zSeed)}
                onClick={() => {
                  const newSeed = [Number(xSeed), Number(ySeed), Number(zSeed)];
                  setSeeds(seeds.filter(seed => seed[0] !== newSeed[0] || seed[1] !== newSeed[1] || seed[2] !== newSeed[2]));
                }}
              >Remove seed</Button>{' '}
              <br />
              <Button
                className="mt-2 float-right"
                variant="danger"
                onClick={() => {
                  setSeeds([]);
                }}
              >Reset seeds</Button>
              {' '}
              <Button
                className="mt-2"
                onClick={() => {
                  const element = document.createElement("a");
                  const file = new Blob([seeds.map(seed => seed.join(' ')).join('\n')], { type: 'text/plain' });
                  element.href = URL.createObjectURL(file);
                  element.download = "seeds.txt";
                  document.body.appendChild(element);
                  element.click();
                }}
                variant="success"
              >Save seeds to file</Button>
              <hr />
            </div>}
            <h5>Demos</h5>
            <Button
              className="mt-2"
              onClick={() => {
                setSeeds([[25, 25, 25]]);
                setToStayAlive(parseAliveFromRule('0-6'));
                setToGetAlive(parseAliveFromRule('1,3'));
                setMaxState(1);
                setNeighbourhood('N');
                setCurrentRule('0-6/1,3/2/N');
                setColorMode('oneColor');
                setStateColors(['0x986a44']);
              }}
              variant="outline-primary"
            >Crystal Growth 1</Button>{' '}

            <Button
              className="mt-2"
              onClick={() => {
                setSeeds([[25, 25, 25]]);
                setToStayAlive(parseAliveFromRule('1-2'));
                setToGetAlive(parseAliveFromRule('1,3'));
                setMaxState(4);
                setNeighbourhood('N');
                setCurrentRule('1-2/1,3/5/N');
                setColorMode('rgb');
              }}
              variant="outline-primary"
            >Crystal Growth 2</Button>{' '}

            <Button
              className="mt-2"
              onClick={() => {
                setSeeds([[1, 1, 1], [1, 1, 2], [1, 2, 2], [2, 2, 2]]);
                setToStayAlive(parseAliveFromRule('4'));
                setToGetAlive(parseAliveFromRule('4'));
                setMaxState(4);
                setNeighbourhood('M');
                setCurrentRule('4/4/5/M');
                setColorMode('state');
                setStateColors(['0x000000', '0xD0E7D2', '0xB0D9B1', '0x79AC78', '0x618264']);
              }}
              variant="outline-primary"
            >Slime Wall</Button>{' '}

            <hr />
            <p>If you like this app consider using software from blog with better performance and usage <a href='https://softology.pro/voc.htm' target="_blank" rel="noopener noreferrer">Download Visions of Chaos</a>.</p>
            <p>Author: <a href="mailto:zdravecky.zdravecky@gmail.com">Peter Zdravecký</a></p>
          </Col>
        </Row>
      </Container>
    </div >
  );
}

export default App;
