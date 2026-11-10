export type TrancoRank = { date: string; rank: number };
export type TrancoReply = { ranks: TrancoRank[] };

export function summarize(ranks: TrancoRank[]) {
	if (!ranks.length) return null;
	const values = ranks.map((r) => r.rank);
	const oldest = ranks[ranks.length - 1];
	return {
		current: ranks[0].rank,
		date: ranks[0].date,
		best: Math.min(...values),
		worst: Math.max(...values),
		change: oldest.rank - ranks[0].rank,
		days: ranks.length,
	};
}

export function sparkline(ranks: TrancoRank[]): SVGElement | null {
	if (ranks.length < 2) return null;
	const ns = 'http://www.w3.org/2000/svg';
	const ordered = [...ranks].reverse();
	const values = ordered.map((r) => r.rank);
	const min = Math.min(...values);
	const span = Math.max(...values) - min || 1;
	const width = 600;
	const height = 100;
	const points = ordered.map((r, i) => {
		const x = (i / (ordered.length - 1)) * width;
		const y = 6 + ((r.rank - min) / span) * (height - 12);
		return `${x.toFixed(1)},${y.toFixed(1)}`;
	});
	const svg = document.createElementNS(ns, 'svg');
	svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
	svg.setAttribute('preserveAspectRatio', 'none');
	svg.setAttribute('class', 'rk-spark');
	svg.setAttribute('role', 'img');
	svg.setAttribute(
		'aria-label',
		`Rank from #${ordered[0].rank} to #${ordered[ordered.length - 1].rank} between ${ordered[0].date} and ${ordered[ordered.length - 1].date}`,
	);
	const line = document.createElementNS(ns, 'polyline');
	line.setAttribute('points', points.join(' '));
	line.setAttribute('fill', 'none');
	line.setAttribute('stroke', 'currentColor');
	line.setAttribute('stroke-width', '2');
	line.setAttribute('vector-effect', 'non-scaling-stroke');
	svg.append(line);
	return svg;
}
