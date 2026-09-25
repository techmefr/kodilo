import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const slugs = [
	'terraform-plan-visualizer',
	'helm-values-converter',
	'nginx-location-tester',
	'ssh-key-fingerprint',
	'iam-policy-visualizer',
	'promql-explainer',
	'iptables-explainer',
	'ps-top-explainer',
];

test('terraform plan summary counts actions and flags data loss', async ({ page }) => {
	await page.goto('tools/terraform-plan-visualizer/');
	await expect(page.locator('#tp-stats')).toContainText('2Create');
	await expect(page.locator('#tp-stats')).toContainText('1Replace');
	await expect(page.locator('#tp-risks')).toContainText('aws_db_instance.main holds data');
	await expect(page.locator('#tp-risks')).toContainText('0.0.0.0/0');
	await expect(page.locator('.tp-force')).toContainText('identifier');
	const json = JSON.stringify({
		resource_changes: [
			{ address: 'aws_instance.a', type: 'aws_instance', change: { actions: ['delete'], before: { ami: 'x' }, after: null } },
			{ address: 'aws_vpc.main', type: 'aws_vpc', change: { actions: ['no-op'], before: {}, after: {} } },
		],
	});
	await page.locator('#tp-in').fill(json);
	await expect(page.locator('#tp-stats')).toContainText('1Destroy');
	await expect(page.locator('.tp-res')).toHaveCount(1);
});

test('helm converter escapes keys and round-trips', async ({ page }) => {
	await page.goto('tools/helm-values-converter/');
	const out = page.locator('#hv-out');
	await expect(out).toContainText("--set 'ingress.annotations.cert-manager\\.io/cluster-issuer=letsencrypt'");
	await expect(out).toContainText("--set 'ingress.hosts[0].paths[0].path=/'");
	await expect(out).toContainText('--set-string env.DEBUG=false');
	await expect(out).toContainText("--set 'env.FEATURE_FLAGS=search\\,checkout'");
	await page.getByRole('button', { name: '--set → values.yaml' }).click();
	await page.locator('#hv-in').fill("helm install x y --set a.b=1,c[0]=z --set-string tag=007 --set 'k\\.io=v'");
	await expect(out).toContainText('b: 1');
	await expect(out).toContainText('- z');
	await expect(out).toContainText('tag: "007"');
	await expect(out).toContainText('k.io: v');
});

test('nginx tester follows the matching order', async ({ page }) => {
	await page.goto('tools/nginx-location-tester/');
	await expect(page.locator('#nl-win')).toContainText('location ~ ^/api/v[0-9]+/');
	await page.getByRole('button', { name: '/api/health' }).click();
	await expect(page.locator('#nl-win code')).toHaveText('location /api/');
	await page.getByRole('button', { name: '/static/logo.png' }).click();
	await expect(page.locator('#nl-win code')).toHaveText('location ^~ /static/');
	await expect(page.locator('.nl-item', { hasText: 'png|jpe' })).toHaveAttribute('data-status', 'skip');
	await page.getByRole('button', { name: '/images/hero.JPG' }).click();
	await expect(page.locator('#nl-win code')).toContainText('~*');
	await page.getByRole('button', { name: '/', exact: true }).click();
	await expect(page.locator('#nl-win code')).toHaveText('location = /');
});

test('ssh fingerprint matches ssh-keygen', async ({ page }) => {
	await page.goto('tools/ssh-key-fingerprint/');
	const cards = page.locator('.sk-card');
	await expect(cards).toHaveCount(2);
	await expect(cards.nth(0)).toContainText('SHA256:BloY6gWB9LCPROqmVJVUwB9yQ++DaZpyyfT5vCGTjYA');
	await expect(cards.nth(0)).toContainText('MD5:6a:f3:d9:96:43:fa:8e:7e:81:b3:6c:41:36:13:af:f0');
	await expect(cards.nth(0)).toContainText('alice@laptop');
	await expect(cards.nth(1)).toContainText('RSA 3072');
	await expect(cards.nth(1)).toContainText('SHA256:Th1IC53QEI/KML/kjrQ4GH0Xdqx4Ewk2XkG+Ec2XGGI');
	await page.locator('#sk-in').fill('-----BEGIN OPENSSH PRIVATE KEY-----');
	await expect(page.locator('.sk-card .error')).toContainText('private key');
});

test('iam visualizer flags public and admin statements', async ({ page }) => {
	await page.goto('tools/iam-policy-visualizer/');
	await expect(page.locator('.iam-card')).toHaveCount(4);
	await expect(page.locator('.iam-card[data-effect="deny"]')).toHaveCount(1);
	await expect(page.locator('.iam-card', { hasText: 'PublicReadAssets' })).toContainText('Public: anyone');
	await expect(page.locator('.iam-card', { hasText: 'AdminEverything' })).toContainText('full administrator');
	await expect(page.locator('.iam-card', { hasText: 'DenyInsecureTransport' })).toContainText('aws:SecureTransport is false');
	await page.locator('#iam-in').fill('{"Statement":{"Effect":"Allow","Action":"iam:PassRole","Resource":"*"}}');
	await expect(page.locator('.iam-card')).toContainText('Privilege escalation');
	await page.locator('#iam-in').fill('{');
	await expect(page.locator('#iam-error')).toBeVisible();
});

test('promql explainer orders evaluation steps', async ({ page }) => {
	await page.goto('tools/promql-explainer/');
	const steps = page.locator('.pq-step');
	await expect(steps.first()).toContainText('status matches regex "5.."');
	await expect(steps.nth(1)).toContainText('rate()');
	await expect(page.locator('#pq-steps')).toContainText('grouped by service');
	await expect(steps.last()).toContainText('Filters');
	await expect(page.locator('#pq-type')).toHaveText('returns instant vector');
	await page.locator('#pq-in').fill('histogram_quantile(0.9, sum by (job) (rate(x_bucket[5m])))');
	await expect(page.locator('.pq-warn')).toContainText('drops the le label');
	await page.locator('#pq-in').fill('sum(rate(x[5m])');
	await expect(page.locator('#pq-error')).toBeVisible();
});

test('iptables explainer reads both formats', async ({ page }) => {
	await page.goto('tools/iptables-explainer/');
	const input = page.locator('.it-chain[data-chain="INPUT"]');
	await expect(input).toContainText('Default: DROP');
	await expect(input).toContainText('to port 22 (SSH)');
	await expect(input).toContainText('never matched');
	await expect(input).toContainText('Jump to chain f2b-sshd');
	await page.getByRole('button', { name: 'iptables-save with NAT' }).click();
	await expect(page.locator('#it-format')).toHaveText('iptables-save format');
	await expect(page.locator('.it-chain[data-chain="PREROUTING"]')).toContainText('Forward to 10.0.0.5:80');
	await expect(page.locator('.it-chain[data-chain="INPUT"]')).toContainText('from not 10.0.0.0/8');
	await expect(page.locator('#it-svg')).toContainText('POSTROUTING');
});

test('ps explainer sorts and highlights heavy processes', async ({ page }) => {
	await page.goto('tools/ps-top-explainer/');
	const firstCmd = page.locator('#pt-table tbody tr').first().locator('td.cmd');
	await expect(firstCmd).toContainText('server.js');
	await expect(page.locator('#pt-table tr.hot-cpu')).toHaveCount(3);
	await expect(page.locator('#pt-states')).toContainText('Zombie');
	await page.getByRole('button', { name: /^PID/ }).click();
	await expect(page.locator('#pt-table tbody tr').first().locator('td').nth(1)).toHaveText('3701');
	await page.getByRole('button', { name: 'top', exact: true }).click();
	await expect(page.locator('#pt-summary')).toContainText('Load average 3.42');
	await expect(page.locator('#pt-table tbody tr')).toHaveCount(8);
});

for (const slug of slugs) {
	for (const scheme of ['light', 'dark'] as const) {
		test(`${slug} passes axe in ${scheme} mode without page overflow`, async ({ page }) => {
			const errors: string[] = [];
			page.on('pageerror', (e) => errors.push(e.message));
			page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
			await page.emulateMedia({ colorScheme: scheme });
			await page.setViewportSize({ width: 375, height: 800 });
			await page.goto(`tools/${slug}/`);
			await page.waitForTimeout(300);
			const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
			expect(overflow).toBeLessThanOrEqual(0);
			const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
			expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
			expect(errors).toEqual([]);
		});
	}
}
