import { identify, type Comparison } from './hash-compare';

export function paint(target: HTMLElement, text: string, diffs: boolean[], first: number) {
	target.replaceChildren(
		...Array.from(text, (char, i) => {
			if (!diffs[i]) return document.createTextNode(char);
			const mark = document.createElement('mark');
			mark.className = i === first ? 'hc-first' : 'hc-diff';
			mark.textContent = char;
			return mark;
		}),
	);
}

export function verdictText(a: string, b: string, result: Comparison): string {
	if (!a && !b) return 'Paste two hashes to compare them.';
	const kinds = [identify(a), identify(b)].filter(Boolean);
	const algorithm = kinds.length === 2 && kinds[0] === kinds[1] ? kinds[0] : kinds.join(' / ');
	const position = `First difference at position ${result.firstDiff + 1}.`;
	const detail = result.equal
		? 'The hashes are identical.'
		: result.lengthA !== result.lengthB
			? `The lengths differ (${result.lengthA} vs ${result.lengthB}). ${position}`
			: `${result.diffCount} character${result.diffCount === 1 ? ' differs' : 's differ'}. ${position}`;
	return `${result.equal ? 'Match' : 'Different'}. ${detail}${algorithm ? ` Looks like ${algorithm}.` : ''}`;
}
