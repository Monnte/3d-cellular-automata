import React, { useEffect, useState } from 'react';
import { Boxes } from './renderFunctions';
import * as THREE from "three";

function create3DArray(gridSize, value, seeds = [], maxValue = 1) {
	let my3DArray = Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => value)));
	seeds.forEach(seed => {
		my3DArray[seed[0]][seed[1]][seed[2]] = maxValue;
	});
	return my3DArray;
}

export const CelluarAutomata = ({ gridSize, isRunning, seeds, maxState, toStayAlive, toGetAlive, neighbourhood, colorMode, stateColors}) => {
	const [cells, setCells] = useState(create3DArray(gridSize, 0, seeds, maxState));

	useEffect(() => {
		if (!isRunning) return;
		const interval = setInterval(() => {
			updateCells();
		}, 300);

		return () => {
			clearInterval(interval);
		};
	}, [isRunning]);

	useEffect(() => {
		setCells(create3DArray(gridSize, 0, seeds, maxState));
	}, [seeds]);


	function countNeighbours(x, y, z, cells, neighbourhood = 'M') {
		let count = 0;

		if (neighbourhood === 'M') {
			for (let i = -1; i <= 1; i++) {
				for (let j = -1; j <= 1; j++) {
					for (let k = -1; k <= 1; k++) {
						if (i === 0 && j === 0 && k === 0) continue;
						if (cells?.[x + i]?.[y + j]?.[z + k] !== 0 && cells?.[x + i]?.[y + j]?.[z + k] !== undefined) {
							count++;
						}
					}
				}
			}
		} else if (neighbourhood === 'N') {
			for (let i = -1; i <= 1; i++) {
				for (let j = -1; j <= 1; j++) {
					for (let k = -1; k <= 1; k++) {
						if (i === 0 && j === 0 && k === 0) continue;
						if (Math.abs(i) + Math.abs(j) + Math.abs(k) > 1) continue;
						if (cells?.[x + i]?.[y + j]?.[z + k] !== 0 && cells?.[x + i]?.[y + j]?.[z + k] !== undefined) {
							count++;
						}
					}
				}
			}
		}
		else{
			throw new Error("Invalid neighbourhood");
		}

		return count;
	}

	function updateCells() {
		setCells(cells => {
			let newCells = create3DArray(gridSize, 0);
			for (let i = 0; i < gridSize; i++) {
				for (let j = 0; j < gridSize; j++) {
					for (let k = 0; k < gridSize; k++) {
						const neighbours = countNeighbours(i, j, k, cells, neighbourhood);
						if (cells[i][j][k] === 1) {
							if (!toStayAlive.includes(neighbours)) {
								newCells[i][j][k] = 0;
							} else {
								newCells[i][j][k] = 1;
							}
						} else if (cells[i][j][k] === 0) {
							if (toGetAlive.includes(neighbours)) {
								newCells[i][j][k] = maxState;
							}
						} else {
							newCells[i][j][k] = cells[i][j][k] - 1;
						}
					}
				}
			}
			return newCells;
		});

	}

	return (
		<>
			<Boxes cells={cells} gridSize={gridSize} colorMode={colorMode} stateColors={stateColors} maxState={maxState} />
		</>
	);
}