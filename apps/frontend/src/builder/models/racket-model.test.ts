import { BoxGeometry, Group, Mesh } from 'three';

import {
	getGeometryBottomY,
	getRacketGeometries,
	RACKET_MODEL_NODES,
} from '@builder/models/racket-model';

const allNodes = (): Record<string, Mesh> =>
	Object.fromEntries(
		Object.values(RACKET_MODEL_NODES).map((name) => [name, new Mesh(new BoxGeometry())]),
	);

describe('racket-model', () => {
	it('picks one geometry per model part', () => {
		const nodes = allNodes();
		const geometries = getRacketGeometries({ nodes });

		expect(geometries.frame).toBe(nodes[RACKET_MODEL_NODES.frame]?.geometry);
		expect(geometries.strings).toBe(nodes[RACKET_MODEL_NODES.strings]?.geometry);
	});

	it('throws when a part is missing or not a mesh', () => {
		const nodes: Record<string, Mesh | Group> = allNodes();
		nodes[RACKET_MODEL_NODES.handle] = new Group();

		expect(() => getRacketGeometries({ nodes })).toThrow('zone_handle');
	});

	it('reads the lowest point of a geometry', () => {
		const geometry = new BoxGeometry(1, 2, 1).translate(0, -1, 0);

		expect(getGeometryBottomY({ geometry })).toBeCloseTo(-2);
		expect(getGeometryBottomY({ geometry })).toBeCloseTo(-2);
	});
});
