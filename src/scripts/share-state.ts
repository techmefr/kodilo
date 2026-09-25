type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
type State = Record<string, string | boolean>;

export const SHARE_KEY = 's';
export const SHARE_LIMIT = 8 * 1024;
const SKIPPED_TYPES = new Set(['file', 'password', 'hidden', 'button', 'submit', 'reset', 'image']);
const GROUP_PREFIX = '@';

function excluded(element: Element) {
	return !!element.closest('[data-no-share], [data-share-ui]');
}

function fields(root: HTMLElement): Field[] {
	return Array.from(root.querySelectorAll<Field>('input[id], textarea[id], select[id]')).filter((field) => {
		if (excluded(field) || field.disabled) return false;
		if (field instanceof HTMLInputElement && (SKIPPED_TYPES.has(field.type) || field.readOnly)) return false;
		if (field instanceof HTMLTextAreaElement && field.readOnly) return false;
		return true;
	});
}

function groupOptions(group: HTMLElement) {
	return Array.from(group.children).filter(
		(child): child is HTMLElement =>
			child instanceof HTMLElement && child.dataset.value !== undefined && (child.hasAttribute('aria-pressed') || child.getAttribute('role') === 'radio'),
	);
}

function isOn(option: HTMLElement) {
	return option.getAttribute('aria-pressed') === 'true' || option.getAttribute('aria-checked') === 'true';
}

function groups(root: HTMLElement) {
	return Array.from(root.querySelectorAll<HTMLElement>('[id]')).filter((group) => !excluded(group) && groupOptions(group).length > 1);
}

function selectDefault(select: HTMLSelectElement) {
	return (Array.from(select.options).find((option) => option.defaultSelected) ?? select.options[0])?.value ?? '';
}

const initialGroups = new WeakMap<HTMLElement, string>();

function groupValue(group: HTMLElement) {
	return groupOptions(group).find(isOn)?.dataset.value ?? '';
}

export function snapshotDefaults(root: HTMLElement) {
	for (const group of groups(root)) initialGroups.set(group, groupValue(group));
}

export function collectState(root: HTMLElement): State {
	const state: State = {};
	for (const group of groups(root)) {
		const value = groupValue(group);
		if (value !== (initialGroups.get(group) ?? '')) state[`${GROUP_PREFIX}${group.id}`] = value;
	}
	for (const field of fields(root)) {
		if (field instanceof HTMLInputElement && (field.type === 'checkbox' || field.type === 'radio')) {
			if (field.checked !== field.defaultChecked) state[field.id] = field.checked;
		} else if (field instanceof HTMLSelectElement) {
			if (field.value !== selectDefault(field)) state[field.id] = field.value;
		} else if (field.value !== field.defaultValue) {
			state[field.id] = field.value;
		}
	}
	return state;
}

export function applyState(root: HTMLElement, state: State) {
	for (const [key, value] of Object.entries(state)) {
		if (!key.startsWith(GROUP_PREFIX)) continue;
		const group = document.getElementById(key.slice(GROUP_PREFIX.length));
		if (!group || !root.contains(group) || excluded(group)) continue;
		const option = groupOptions(group).find((candidate) => candidate.dataset.value === String(value));
		if (option && !isOn(option)) option.click();
	}
	const allowed = new Map(fields(root).map((field) => [field.id, field]));
	for (const [key, value] of Object.entries(state)) {
		const field = allowed.get(key);
		if (!field) continue;
		if (field instanceof HTMLInputElement && (field.type === 'checkbox' || field.type === 'radio')) field.checked = value === true;
		else field.value = String(value);
		field.dispatchEvent(new Event('input', { bubbles: true }));
		field.dispatchEvent(new Event('change', { bubbles: true }));
	}
}

async function transform(bytes: Uint8Array, stream: CompressionStream | DecompressionStream) {
	const output = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
	return new Uint8Array(await new Response(output).arrayBuffer());
}

function toBase64Url(bytes: Uint8Array) {
	let binary = '';
	for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text: string) {
	const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
	return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export async function encodeState(state: State) {
	const bytes = new TextEncoder().encode(JSON.stringify(state));
	return toBase64Url(await transform(bytes, new CompressionStream('deflate-raw')));
}

export async function decodeState(code: string): Promise<State> {
	const bytes = await transform(fromBase64Url(code), new DecompressionStream('deflate-raw'));
	const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
	return Object.fromEntries(Object.entries(parsed).filter(([, value]) => typeof value === 'string' || typeof value === 'boolean')) as State;
}

export function readHashCode() {
	return new URLSearchParams(location.hash.slice(1)).get(SHARE_KEY);
}

export async function shareUrl(root: HTMLElement) {
	const state = collectState(root);
	const url = new URL(location.href);
	url.hash = Object.keys(state).length ? `${SHARE_KEY}=${await encodeState(state)}` : '';
	return url.href;
}
