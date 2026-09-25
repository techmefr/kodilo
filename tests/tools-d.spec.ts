import { expect, test } from '@playwright/test';

test('github actions generator outputs a node matrix workflow', async ({ page }) => {
	await page.goto('tools/github-actions-generator/');
	const out = page.locator('#gha-out');
	await expect(out).toContainText('uses: actions/checkout@v4');
	await expect(out).toContainText("version: ['20', '22']");
	await expect(out).toContainText('cancel-in-progress: true');
	await page.locator('#gha-cron').fill('0 3 * * 1');
	await expect(out).toContainText("- cron: '0 3 * * 1'");
	await page.locator('#gha-stack button', { hasText: 'Docker' }).click();
	await expect(out).toContainText('uses: docker/build-push-action@v6');
	await expect(out).toContainText('packages: write');
});

test('dockerfile generator adds a non-root user and lints bad instructions', async ({ page }) => {
	await page.goto('tools/dockerfile-generator/');
	await expect(page.locator('#df-out')).toContainText('USER node');
	await expect(page.locator('#df-out')).toContainText('HEALTHCHECK');
	await expect(page.locator('#df-ignore')).toContainText('node_modules');
	await page.locator('#df-mode button', { hasText: 'Lint' }).click();
	const input = page.locator('#df-lint-in');
	await input.fill(
		'FROM node:latest\nADD . /app\nRUN apt-get update && apt-get install -y curl\nRUN curl -sL https://x.sh | sh\nENV DB_PASSWORD=hunter2\nEXPOSE\n',
	);
	const findings = page.locator('#df-findings');
	await expect(findings).toContainText('line 1 Pin a version instead of node:latest.');
	await expect(findings).toContainText('line 2 Use COPY instead of ADD');
	await expect(findings).toContainText('line 3 apt-get install without --no-install-recommends.');
	await expect(findings).toContainText('line 4 Piping a download into a shell');
	await expect(findings).toContainText('line 4 Consecutive RUN');
	await expect(findings).toContainText('line 5 Secret-looking value');
	await expect(findings).toContainText('line 6 EXPOSE needs a port.');
	await expect(findings).toContainText('No USER');
});

test('compose validator reports semantic errors and syntax positions', async ({ page }) => {
	await page.goto('tools/docker-compose-validator/');
	const findings = page.locator('#dc-findings');
	await expect(findings).toContainText('The version key is obsolete');
	await expect(findings).toContainText('"web" depends on unknown service "cache".');
	await expect(findings).toContainText('Port out of range in "99999:443"');
	await expect(findings).toContainText('Network "back" used by "api" is not defined.');
	await expect(findings).toContainText('Volume "logs" used by "api" is not defined.');
	await expect(findings).toContainText('container_name "web" is also used by "web".');
	await expect(findings).toContainText('Service "worker" has neither image nor build.');
	await expect(findings).toContainText('restart "sometimes"');
	await expect(page.locator('#dc-vars')).toHaveText('$DATABASE_URL  $LOG_LEVEL');
	await expect(page.locator('#dc-rows tr').first()).toContainText('nginx:1.27');
	await page.locator('#dc-in').fill('services:\n  web:\n    image: [nginx\n');
	await expect(page.locator('#dc-status')).toContainText('error');
	await expect(findings).toContainText('error ·');
	await page.locator('#dc-in').fill('services:\n  web:\n    image: nginx:1.27\n    ports: ["8080:80"]\n');
	await expect(page.locator('#dc-status')).toHaveText('✓ Valid');
});

test('kubernetes secret encoder base64 encodes utf-8 and decodes back', async ({ page }) => {
	await page.goto('tools/kubernetes-secret-encoder/');
	const out = page.locator('#ks-out');
	await expect(out).toContainText('username: YWRtaW4=');
	await expect(out).toContainText('password: czNjcjN0LXDDpHNz');
	await expect(out).toContainText('namespace: production');
	await page.locator('#ks-string').check();
	await expect(out).toContainText('stringData:');
	await expect(out).toContainText('username: admin');
	await page.locator('#ks-string').uncheck();
	await page.locator('#ks-env').fill('API_TOKEN="abc"\nexport MODE=prod');
	await page.locator('#ks-import').click();
	await expect(out).toContainText('API_TOKEN: YWJj');
	await expect(out).toContainText('MODE: cHJvZA==');
	await page.locator('#ks-type button', { hasText: 'Docker registry' }).click();
	await expect(out).toContainText('type: kubernetes.io/dockerconfigjson');
	await expect(out).toContainText('.dockerconfigjson: ');
	await page.locator('#ks-mode button', { hasText: 'Decode' }).click();
	await expect(page.locator('#ks-dec-out')).toContainText('username=admin');
	await expect(page.locator('#ks-dec-out')).toContainText('password=s3cr3t-päss');
});

test('caddyfile generator builds a proxy with redirect and auth', async ({ page }) => {
	await page.goto('tools/caddyfile-generator/');
	const out = page.locator('#cd-out');
	await expect(out).toContainText('www.example.com {');
	await expect(out).toContainText('redir https://example.com{uri} permanent');
	await expect(out).toContainText('reverse_proxy localhost:3000 localhost:3001 {');
	await expect(out).toContainText('lb_policy round_robin');
	await expect(out).toContainText('encode zstd gzip');
	await page.locator('#cd-auth-user').fill('admin');
	await expect(out).toContainText('basic_auth {');
	await page.locator('#cd-mode button', { hasText: 'Static files' }).click();
	await expect(out).toContainText('root * /srv/www');
	await expect(out).toContainText('file_server');
	await expect(out).not.toContainText('reverse_proxy');
});

test('cidr aggregator merges, excludes and splits', async ({ page }) => {
	await page.goto('tools/cidr-aggregator/');
	await page.locator('#ca-ex').fill('');
	await page.locator('#ca-in').fill('10.0.0.0/25\n10.0.0.128/25');
	await expect(page.locator('#ca-out')).toHaveText('10.0.0.0/24');
	await expect(page.locator('#ca-total')).toHaveText('256');
	await page.locator('#ca-in').fill('192.168.1.0-192.168.1.9');
	await expect(page.locator('#ca-out')).toHaveText('192.168.1.0/29\n192.168.1.8/31');
	await page.locator('#ca-in').fill('10.0.0.0/24');
	await page.locator('#ca-ex').fill('10.0.0.0/26');
	await expect(page.locator('#ca-out')).toHaveText('10.0.0.64/26\n10.0.0.128/25');
	await expect(page.locator('#ca-total')).toHaveText('192');
	await page.locator('#ca-in').fill('0.0.0.0/1\n128.0.0.0/1');
	await page.locator('#ca-ex').fill('');
	await expect(page.locator('#ca-out')).toHaveText('0.0.0.0/0');
	await expect(page.locator('#ca-total')).toHaveText('4,294,967,296');
	await page.locator('#ca-mode button', { hasText: 'Split' }).click();
	await expect(page.locator('#ca-split-head')).toHaveText('4 subnets of /26');
	await expect(page.locator('#ca-split-out')).toContainText('10.0.0.192/26');
	await page.locator('#ca-by').selectOption('prefix');
	await page.locator('#ca-n').fill('25');
	await expect(page.locator('#ca-split-head')).toHaveText('2 subnets of /25');
});
