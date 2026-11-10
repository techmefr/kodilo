import { getJson, type BadgeKind } from './net';

export const RECORD_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT', 'SOA', 'CAA'] as const;
export const COMMON_SELECTORS = ['default', 'google', 'selector1', 'selector2', 'k1', 's1', 'mail'];

export type DnsAnswer = { name: string; type: number; TTL: number; data: string };
export type DnsReply = { Status: number; Answer?: DnsAnswer[] };
export type Check = { kind: BadgeKind; title: string; detail: string };

const TYPE_NUMBER: Record<string, number> = { A: 1, NS: 2, CNAME: 5, SOA: 6, MX: 15, TXT: 16, AAAA: 28, CAA: 257 };

export type DnsResult = { status: number; answers: DnsAnswer[] };

export async function queryDns(name: string, type: string): Promise<DnsResult> {
	const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`;
	const reply = await getJson<DnsReply>(url, 'application/dns-json');
	return { status: reply.Status, answers: (reply.Answer ?? []).filter((a) => a.type === TYPE_NUMBER[type]) };
}

export function txtValue(answer: DnsAnswer): string {
	const parts = answer.data.match(/"((?:[^"\\]|\\.)*)"/g);
	return parts ? parts.map((p) => p.slice(1, -1).replace(/\\(.)/g, '$1')).join('') : answer.data;
}

export function spfCheck(txt: string[]): Check[] {
	const records = txt.filter((t) => /^v=spf1(\s|$)/i.test(t));
	if (!records.length)
		return [{ kind: 'fail', title: 'SPF', detail: 'No SPF record found. Receivers cannot tell which servers may send mail for this domain.' }];
	if (records.length > 1)
		return [{ kind: 'fail', title: 'SPF', detail: 'More than one SPF record exists. Receivers treat this as a permanent error, so merge them into one.' }];
	const terms = records[0].trim().split(/\s+/).slice(1);
	const lookups = terms.filter((t) => /^[+\-~?]?(include:|a(:|\/|$)|mx(:|\/|$)|ptr|exists:)/i.test(t) || /^redirect=/i.test(t)).length;
	const all = terms.find((t) => /^[+\-~?]?all$/i.test(t));
	const results: Check[] = [];
	if (!all && !terms.some((t) => /^redirect=/i.test(t))) {
		results.push({ kind: 'warn', title: 'SPF', detail: 'The record has no "all" mechanism, so it never says what to do with other senders.' });
	} else if (all === '+all' || all === 'all') {
		results.push({ kind: 'fail', title: 'SPF', detail: 'The record ends with +all, which lets anyone send mail as this domain.' });
	} else {
		results.push({ kind: 'pass', title: 'SPF', detail: `A valid-looking SPF record is published (${all ?? 'redirect'}).` });
	}
	if (lookups > 10)
		results.push({ kind: 'fail', title: 'SPF lookups', detail: `${lookups} DNS lookups in this record. The limit is 10, so evaluation will fail.` });
	else if (lookups >= 8)
		results.push({ kind: 'warn', title: 'SPF lookups', detail: `${lookups} DNS lookups in this record. Included records add more, and the limit is 10.` });
	else results.push({ kind: 'pass', title: 'SPF lookups', detail: `${lookups} DNS lookups counted in this record (limit 10, includes not expanded).` });
	return results;
}

export function dmarcCheck(txt: string[]): Check {
	const records = txt.filter((t) => /^v=DMARC1\s*;?/i.test(t));
	if (!records.length) return { kind: 'fail', title: 'DMARC', detail: 'No DMARC record at _dmarc. Spoofed mail will not be reported or rejected.' };
	if (records.length > 1) return { kind: 'fail', title: 'DMARC', detail: 'More than one DMARC record exists, so receivers ignore them.' };
	const tags = Object.fromEntries(records[0].split(';').map((p) => p.trim().split(/=(.*)/s).slice(0, 2)));
	const policy = String(tags.p ?? '').toLowerCase();
	if (policy === 'reject' || policy === 'quarantine')
		return { kind: 'pass', title: 'DMARC', detail: `Policy is p=${policy}. Failing mail is ${policy === 'reject' ? 'rejected' : 'sent to spam'}.` };
	if (policy === 'none')
		return { kind: 'warn', title: 'DMARC', detail: 'Policy is p=none: monitoring only. Move to quarantine or reject once reports look clean.' };
	return { kind: 'fail', title: 'DMARC', detail: 'The record has no valid p= policy tag.' };
}

export function dkimCheck(found: string[], tried: string[]): Check {
	if (found.length) return { kind: 'pass', title: 'DKIM', detail: `Key found for selector ${found.join(', ')}.` };
	return { kind: 'warn', title: 'DKIM', detail: `No key at ${tried.join(', ')}. Your provider may use another selector.` };
}

export function mxCheck(mx: DnsAnswer[]): Check {
	if (!mx.length) return { kind: 'warn', title: 'MX', detail: 'No MX record. This domain cannot receive email.' };
	return { kind: 'pass', title: 'MX', detail: `${mx.length} mail server${mx.length === 1 ? '' : 's'} published.` };
}
