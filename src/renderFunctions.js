import React, { useRef, useEffect,useState } from 'react'
import * as THREE from "three";
import { Outlines } from '@react-three/drei';

export function Boxes({ cells, gridSize, colorMode='rgb', stateColors=[], maxState=1}) {
	const meshRef = useRef();
	const [tempObject,] = useState(new THREE.Object3D());
	const [color,] = useState(new THREE.Color());


	useEffect(() => {
		if (meshRef == null) return;
		if (meshRef.current == null) return;

		for (let x = 0; x < gridSize; x++)
			for (let y = 0; y < gridSize; y++)
				for (let z = 0; z < gridSize; z++) {
					const id = z + gridSize * (y + gridSize * x);
					if (cells[x][y][z] !== 0) {
						const newPosition = [x - gridSize / 2 + 0.5, y - gridSize / 2 + 0.5, z - gridSize / 2 + 0.5];
						tempObject.position.set(...newPosition);
						tempObject.scale.set(1, 1, 1);
						tempObject.updateMatrix();
						meshRef.current.setMatrixAt(id, tempObject.matrix);
						if (colorMode === 'state' && stateColors.length > 0 && stateColors.length === maxState + 1) {
							meshRef.current.setColorAt(id, color.setHex(stateColors[cells[x][y][z]]));
						} else if (colorMode === 'random') {
							meshRef.current.setColorAt(id, color.setHex(Math.random() * 0xffffff));
						} else if (colorMode === 'oneColor') {
							meshRef.current.setColorAt(id, color.setHex(stateColors[0]));
						} else{
							meshRef.current.setColorAt(id, color.setRGB(newPosition[0] / gridSize + 0.1, newPosition[1] / gridSize + 0.1, newPosition[2] / gridSize + 0.1));
						}
						meshRef.current.instanceColor.needsUpdate = true;
					}
					else {
						tempObject.scale.set(0, 0, 0);
						tempObject.updateMatrix();
						meshRef.current.setMatrixAt(id, tempObject.matrix);
					}
				}
		meshRef.current.instanceMatrix.needsUpdate = true;
	}, [cells, colorMode, stateColors]);

	return (
		<instancedMesh ref={meshRef} args={[null, null, gridSize * gridSize * gridSize]}>
			<boxGeometry args={[1, 1, 1]}></boxGeometry>
			<meshBasicMaterial attach="material"/>
			<Outlines thickness={0.15} color="black" />
		</instancedMesh>
	);
}

export function CellBox({ gridSize, color, boxGeometry, ...props }) {
	const meshRef = useRef();
	return (
		<mesh
			ref={meshRef}
			{...props}
			scale={1}

		>
			<boxGeometry attach="geometry" args={[1, 1, 1]} />
			<meshStandardMaterial attach="material" color={color} />
			<lineSegments position={[0, 0, 0]} >
				<edgesGeometry attach="geometry" args={[boxGeometry]} />
				<lineBasicMaterial attach="material" color='black' />
			</lineSegments>
		</mesh>
	)
}

export function GridBox({ gridSize, showFill, boxGeometry, ...props }) {
	const meshRef = useRef()
	return (
		<>
			<mesh
				{...props}
				position={[0, 0, 0]}
				ref={meshRef}
				scale={gridSize}
			>
				<lineSegments position={[0, 0, 0]} >
					<edgesGeometry attach="geometry" args={[boxGeometry]} />
					<lineBasicMaterial attach="material" color='white' />
				</lineSegments>
			</mesh>
		</>
	)
}
