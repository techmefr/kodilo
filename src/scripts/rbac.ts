export const scopes = ['none', 'own', 'team', 'agency', 'all'] as const;
export type Scope = (typeof scopes)[number];

export interface Role {
	name: string;
	extends?: string;
}

export interface Matrix {
	roles: Role[];
	resources: string[];
	actions: string[];
	permissions: Record<string, Record<string, Record<string, Scope>>>;
}

export interface Decision {
	scope: Scope;
	source: string | null;
	chain: string[];
}

export const rank = (s: Scope) => scopes.indexOf(s);

export function sampleMatrix(): Matrix {
	return {
		roles: [{ name: 'viewer' }, { name: 'editor', extends: 'viewer' }, { name: 'manager', extends: 'editor' }, { name: 'admin', extends: 'manager' }],
		resources: ['customers', 'invoices', 'users', 'reports'],
		actions: ['create', 'read', 'update', 'delete', 'export'],
		permissions: {
			viewer: { customers: { read: 'team' }, invoices: { read: 'own' }, reports: { read: 'team' } },
			editor: { customers: { create: 'team', update: 'own' }, invoices: { create: 'own', update: 'own' } },
			manager: {
				customers: { read: 'agency', update: 'team', delete: 'team', export: 'team' },
				invoices: { read: 'agency', update: 'team' },
				users: { read: 'agency' },
				reports: { read: 'agency', export: 'agency' },
			},
			admin: {
				customers: { read: 'all', update: 'all', delete: 'all', export: 'all' },
				invoices: { read: 'all', update: 'all', delete: 'all' },
				users: { create: 'all', read: 'all', update: 'all', delete: 'all' },
				reports: { read: 'all', export: 'all' },
			},
		},
	};
}

export const direct = (m: Matrix, role: string, resource: string, action: string): Scope => m.permissions[role]?.[resource]?.[action] ?? 'none';

export function chainOf(m: Matrix, role: string): string[] {
	const chain: string[] = [];
	let current: string | undefined = role;
	while (current && !chain.includes(current) && m.roles.some((r) => r.name === current)) {
		chain.push(current);
		current = m.roles.find((r) => r.name === current)?.extends;
	}
	return chain;
}

export function decide(m: Matrix, role: string, resource: string, action: string): Decision {
	const chain = chainOf(m, role);
	let best: Decision = { scope: 'none', source: null, chain };
	for (const r of chain) {
		const s = direct(m, r, resource, action);
		if (rank(s) > rank(best.scope)) best = { scope: s, source: r, chain };
	}
	return best;
}

export function setScope(m: Matrix, role: string, resource: string, action: string, scope: Scope) {
	const byRole = (m.permissions[role] ??= {});
	const byRes = (byRole[resource] ??= {});
	if (scope === 'none') delete byRes[action];
	else byRes[action] = scope;
	if (!Object.keys(byRes).length) delete byRole[resource];
	if (!Object.keys(byRole).length) delete m.permissions[role];
}

export function parseMatrix(text: string): Matrix {
	const raw = JSON.parse(text);
	if (!raw || !Array.isArray(raw.roles) || !Array.isArray(raw.resources) || !Array.isArray(raw.actions))
		throw new Error('Expected an object with roles, resources and actions arrays.');
	const roles: Role[] = raw.roles.map((r: unknown) => {
		if (typeof r === 'string') return { name: r };
		const o = r as Role;
		if (!o || typeof o.name !== 'string') throw new Error('Each role needs a name.');
		return o.extends ? { name: o.name, extends: String(o.extends) } : { name: o.name };
	});
	const m: Matrix = { roles, resources: raw.resources.map(String), actions: raw.actions.map(String), permissions: {} };
	for (const [role, byRes] of Object.entries(raw.permissions ?? {}))
		for (const [res, byAct] of Object.entries(byRes as object))
			for (const [act, scope] of Object.entries(byAct as object)) {
				if (!scopes.includes(scope as Scope)) throw new Error(`Unknown scope "${scope}" for ${role}.${res}.${act}.`);
				setScope(m, role, res, act, scope as Scope);
			}
	return m;
}

export function toJson(m: Matrix): string {
	return JSON.stringify(m, null, 2);
}

export function toYaml(m: Matrix): string {
	const lines = ['roles:'];
	m.roles.forEach((r) => lines.push(`  - name: ${r.name}`, ...(r.extends ? [`    extends: ${r.extends}`] : [])));
	lines.push('resources:', ...m.resources.map((r) => `  - ${r}`), 'actions:', ...m.actions.map((a) => `  - ${a}`), 'permissions:');
	for (const [role, byRes] of Object.entries(m.permissions)) {
		lines.push(`  ${role}:`);
		for (const [res, byAct] of Object.entries(byRes)) {
			lines.push(`    ${res}:`);
			for (const [act, s] of Object.entries(byAct)) lines.push(`      ${act}: ${s}`);
		}
	}
	return lines.join('\n');
}

function flat(m: Matrix) {
	const rows: { role: string; name: string; resource: string; action: string; scope: Scope }[] = [];
	for (const role of m.roles)
		for (const resource of m.resources)
			for (const action of m.actions) {
				const d = decide(m, role.name, resource, action);
				if (d.scope !== 'none') rows.push({ role: role.name, name: `${resource}.${action}.${d.scope}`, resource, action, scope: d.scope });
			}
	return rows;
}

const permissionNames = (m: Matrix) => [...new Set(flat(m).map((r) => r.name))].sort();

export function toSpatie(m: Matrix): string {
	const rows = flat(m);
	const q = (s: string) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
	const out = [
		'<?php',
		'',
		'namespace Database\\Seeders;',
		'',
		'use Illuminate\\Database\\Seeder;',
		'use Spatie\\Permission\\Models\\Permission;',
		'use Spatie\\Permission\\Models\\Role;',
		'use Spatie\\Permission\\PermissionRegistrar;',
		'',
		'class RolesAndPermissionsSeeder extends Seeder',
		'{',
		'    public function run(): void',
		'    {',
		'        app()[PermissionRegistrar::class]->forgetCachedPermissions();',
		'',
		'        $permissions = [',
		...permissionNames(m).map((n) => `            ${q(n)},`),
		'        ];',
		'',
		'        foreach ($permissions as $permission) {',
		"            Permission::findOrCreate($permission, 'web');",
		'        }',
	];
	for (const role of m.roles) {
		const names = rows.filter((r) => r.role === role.name).map((r) => q(r.name));
		out.push('', `        Role::findOrCreate(${q(role.name)}, 'web')->syncPermissions([${names.join(', ')}]);`);
	}
	out.push('    }', '}');
	return out.join('\n');
}

const pascal = (s: string) =>
	s
		.replace(/[^A-Za-z0-9]+/g, ' ')
		.trim()
		.replace(/s$/, '')
		.split(' ')
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join('');

const conditions: Record<Scope, string> = {
	none: '',
	own: ', { ownerId: user.id }',
	team: ', { teamId: user.teamId }',
	agency: ', { agencyId: user.agencyId }',
	all: '',
};

export function toCasl(m: Matrix): string {
	const out = [
		"import { AbilityBuilder, createMongoAbility, type MongoAbility } from '@casl/ability';",
		'',
		'type User = { id: number; teamId: number; agencyId: number; role: string };',
		'',
		'export function defineAbilityFor(user: User): MongoAbility {',
		'  const { can, build } = new AbilityBuilder<MongoAbility>(createMongoAbility);',
		'',
		'  switch (user.role) {',
	];
	for (const role of m.roles) {
		out.push(`    case '${role.name}':`);
		flat(m)
			.filter((r) => r.role === role.name)
			.forEach((r) => out.push(`      can('${r.action}', '${pascal(r.resource)}'${conditions[r.scope]});`));
		out.push('      break;');
	}
	out.push('  }', '', '  return build();', '}');
	return out.join('\n');
}

export function toSql(m: Matrix): string {
	const q = (s: string) => `'${s.replace(/'/g, "''")}'`;
	const rows = flat(m);
	const out = [
		'INSERT INTO roles (name, guard_name) VALUES',
		m.roles.map((r) => `  (${q(r.name)}, 'web')`).join(',\n') + ';',
		'',
		'INSERT INTO permissions (name, guard_name) VALUES',
		permissionNames(m)
			.map((n) => `  (${q(n)}, 'web')`)
			.join(',\n') + ';',
	];
	if (rows.length)
		out.push(
			'',
			'INSERT INTO role_has_permissions (role_id, permission_id)',
			'SELECT r.id, p.id FROM roles r JOIN permissions p ON (r.name, p.name) IN (',
			rows.map((r) => `  (${q(r.role)}, ${q(r.name)})`).join(',\n'),
			');',
		);
	return out.join('\n');
}

export interface RoleDiff {
	role: string;
	resource: string;
	action: string;
	before: Scope;
	after: Scope;
	kind: 'granted' | 'revoked' | 'widened' | 'narrowed';
	risky: boolean;
}

const sensitive = /delete|users|role|permission|admin|export/i;

export function diffMatrices(a: Matrix, b: Matrix): RoleDiff[] {
	const roles = [...new Set([...a.roles, ...b.roles].map((r) => r.name))];
	const resources = [...new Set([...a.resources, ...b.resources])];
	const actions = [...new Set([...a.actions, ...b.actions])];
	const out: RoleDiff[] = [];
	for (const role of roles)
		for (const resource of resources)
			for (const action of actions) {
				const before = decide(a, role, resource, action).scope;
				const after = decide(b, role, resource, action).scope;
				if (before === after) continue;
				const kind = before === 'none' ? 'granted' : after === 'none' ? 'revoked' : rank(after) > rank(before) ? 'widened' : 'narrowed';
				const up = rank(after) > rank(before);
				const risky = up && (after === 'all' || sensitive.test(`${resource} ${action}`) || rank(after) - rank(before) >= 2);
				out.push({ role, resource, action, before, after, kind, risky });
			}
	return out;
}
