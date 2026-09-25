export type Prim = 'string' | 'integer' | 'number' | 'boolean';

export interface ShapeField {
	name: string;
	node: ShapeNode;
	optional: boolean;
}

export interface ShapeNode {
	prims: Set<Prim>;
	nullable: boolean;
	object?: ShapeField[];
	array?: ShapeNode;
	empty: boolean;
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

export function shapeOf(values: unknown[]): ShapeNode {
	const prims = new Set<Prim>();
	let nullable = false;
	const objects: Record<string, unknown>[] = [];
	const arrays: unknown[][] = [];
	for (const v of values) {
		if (v === null) nullable = true;
		else if (Array.isArray(v)) arrays.push(v);
		else if (isObject(v)) objects.push(v);
		else if (typeof v === 'string') prims.add('string');
		else if (typeof v === 'boolean') prims.add('boolean');
		else if (typeof v === 'number') prims.add(Number.isInteger(v) ? 'integer' : 'number');
	}
	if (prims.has('number')) prims.delete('integer');
	const node: ShapeNode = { prims, nullable, empty: values.length === 0 };
	if (objects.length) {
		const keys: string[] = [];
		for (const o of objects) for (const k of Object.keys(o)) if (!keys.includes(k)) keys.push(k);
		node.object = keys.map((name) => {
			const present = objects.filter((o) => name in o);
			return { name, node: shapeOf(present.map((o) => o[name])), optional: present.length < objects.length };
		});
	}
	if (arrays.length) node.array = shapeOf(arrays.flat());
	return node;
}

export function kinds(node: ShapeNode) {
	return node.prims.size + (node.object ? 1 : 0) + (node.array ? 1 : 0);
}

export function pascal(name: string) {
	const words = name
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.split(/[^A-Za-z0-9]+/)
		.filter(Boolean);
	const out = words.map((w) => w[0].toUpperCase() + w.slice(1)).join('');
	return /^[0-9]/.test(out) ? `N${out}` : out || 'Field';
}

export function singular(name: string) {
	if (/ies$/.test(name)) return name.slice(0, -3) + 'y';
	if (/(ss|us)$/.test(name)) return name;
	if (/s$/.test(name) && name.length > 1) return name.slice(0, -1);
	return `${name}Item`;
}
