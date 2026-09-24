const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const safeUrl = (url: string) => (/^\s*(javascript|vbscript|data):/i.test(url) && !/^\s*data:image\//i.test(url) ? '#' : url);

export function slug(text: string): string {
	return text.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-');
}

export function inline(text: string): string {
	const codes: string[] = [];
	let s = text.replace(/`([^`]+)`/g, (_, c) => {
		codes.push(`<code>${esc(c)}</code>`);
		return `\u0000${codes.length - 1}\u0000`;
	});
	s = esc(s);
	s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (_, alt, src, title) => `<img src="${safeUrl(src)}" alt="${alt}"${title ? ` title="${title}"` : ''} />`);
	s = s.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (_, label, href, title) => `<a href="${safeUrl(href)}"${title ? ` title="${title}"` : ''}>${label}</a>`);
	s = s.replace(/&lt;(https?:\/\/[^\s&]+)&gt;/g, '<a href="$1">$1</a>');
	s = s.replace(/\*\*(.+?)\*\*|__(.+?)__/g, (_, a, b) => `<strong>${a ?? b}</strong>`);
	s = s.replace(/(^|[^\w*])\*(?!\s)(.+?)\*(?!\w)|(^|\W)_(?!\s)(.+?)_(?!\w)/g, (_, p1, a, p2, b) => `${p1 ?? p2}<em>${a ?? b}</em>`);
	s = s.replace(/~~(.+?)~~/g, '<del>$1</del>');
	s = s.replace(/ {2,}$/gm, '<br />');
	return s.replace(/\u0000(\d+)\u0000/g, (_, i) => codes[Number(i)]);
}

export function markdown(src: string): string {
	const lines = src.replace(/\r\n?/g, '\n').split('\n');
	const out: string[] = [];
	let i = 0;

	const isBlockStart = (l: string) => /^(#{1,6}\s|```|~~~|>|\s*([-*+]|\d+[.)])\s|(\*\s*){3,}$|(-\s*){3,}$|(_\s*){3,}$|\|)/.test(l);

	const list = (start: number, indent: number): [string, number] => {
		const ordered = /^\s*\d+[.)]\s/.test(lines[start]);
		const first = Number(lines[start].match(/^\s*(\d+)/)?.[1] ?? 1);
		const items: string[] = [];
		let j = start;
		while (j < lines.length) {
			const m = lines[j].match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
			if (!m || m[1].length < indent) break;
			if (m[1].length > indent) {
				const [nested, next] = list(j, m[1].length);
				items[items.length - 1] += nested;
				j = next;
				continue;
			}
			let body = m[3];
			j++;
			while (j < lines.length && lines[j].trim() && !/^\s*([-*+]|\d+[.)])\s/.test(lines[j]) && !isBlockStart(lines[j].trim())) body += ` ${lines[j++].trim()}`;
			const task = body.match(/^\[([ xX])\]\s+(.*)$/);
			items.push(task ? `<li class="task"><input type="checkbox" disabled${task[1] !== ' ' ? ' checked' : ''} /> ${inline(task[2])}` : `<li>${inline(body)}`);
			while (j < lines.length && !lines[j].trim() && /^\s*([-*+]|\d+[.)])\s/.test(lines[j + 1] ?? '') && (lines[j + 1].match(/^\s*/)![0].length >= indent)) j++;
		}
		const tag = ordered ? 'ol' : 'ul';
		return [`<${tag}${ordered && first !== 1 ? ` start="${first}"` : ''}>${items.map((it) => `${it}</li>`).join('')}</${tag}>`, j];
	};

	while (i < lines.length) {
		const line = lines[i];
		const t = line.trim();
		if (!t) {
			i++;
			continue;
		}
		const fence = t.match(/^(```|~~~)\s*([\w+-]*)/);
		if (fence) {
			const body: string[] = [];
			i++;
			while (i < lines.length && !lines[i].trim().startsWith(fence[1])) body.push(lines[i++]);
			i++;
			out.push(`<pre><code${fence[2] ? ` class="language-${fence[2]}"` : ''}>${esc(body.join('\n'))}</code></pre>`);
			continue;
		}
		const h = t.match(/^(#{1,6})\s+(.*?)\s*#*$/);
		if (h) {
			const html = inline(h[2]);
			out.push(`<h${h[1].length} id="${slug(html)}">${html}</h${h[1].length}>`);
			i++;
			continue;
		}
		if (/^((\*\s*){3,}|(-\s*){3,}|(_\s*){3,})$/.test(t)) {
			out.push('<hr />');
			i++;
			continue;
		}
		if (t.startsWith('>')) {
			const body: string[] = [];
			while (i < lines.length && lines[i].trim().startsWith('>')) body.push(lines[i++].trim().replace(/^>\s?/, ''));
			out.push(`<blockquote>${markdown(body.join('\n'))}</blockquote>`);
			continue;
		}
		if (/^\s*([-*+]|\d+[.)])\s/.test(line)) {
			const [html, next] = list(i, line.match(/^\s*/)![0].length);
			out.push(html);
			i = next;
			continue;
		}
		if (t.startsWith('|') && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1] ?? '')) {
			const cells = (l: string) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
			const head = cells(line);
			const align = cells(lines[i + 1]).map((c) => (c.startsWith(':') && c.endsWith(':') ? 'center' : c.endsWith(':') ? 'right' : ''));
			i += 2;
			const rows: string[][] = [];
			while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(cells(lines[i++]));
			const td = (tag: string, c: string, k: number) => `<${tag}${align[k] ? ` style="text-align:${align[k]}"` : ''}>${inline(c)}</${tag}>`;
			out.push(`<table><thead><tr>${head.map((c, k) => td('th', c, k)).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${head.map((_, k) => td('td', r[k] ?? '', k)).join('')}</tr>`).join('')}</tbody></table>`);
			continue;
		}
		const para: string[] = [];
		while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i].trim())) para.push(lines[i++]);
		if (!para.length) para.push(lines[i++]);
		const next = lines[i]?.trim() ?? '';
		if (para.length && /^=+$/.test(next)) {
			out.push(`<h1>${inline(para.join(' '))}</h1>`);
			i++;
			continue;
		}
		out.push(`<p>${inline(para.join('\n'))}</p>`);
	}
	return out.join('\n');
}

export const SAMPLE = `# Release notes

A **fast**, *private* toolbox. Everything runs in your browser — see the [source](https://github.com/techmefr/kodilo).

## What changed

- New \`JSON Viewer\` with search
- Faster diffs
  - word-level highlights
  - split and unified views
- [x] Dark mode
- [ ] Offline mode

1. Open a tool
2. Paste your data
3. Copy the result

> Nothing you type is ever uploaded.

| Tool | Category | Status |
| :--- | :------: | -----: |
| Diff Checker | Text | Live |
| RSA Keys | Security | Live |

\`\`\`js
const hello = (name) => \`Hello, \${name}!\`;
\`\`\`

---

~~Old~~ New footer.`;
