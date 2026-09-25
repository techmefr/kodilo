import { expect, test } from '@playwright/test';

test('raid 5 with 4 x 4 TB gives 12 TB usable', async ({ page }) => {
	await page.goto('tools/raid-calculator/');
	await expect(page.locator('#rd-usable')).toHaveText('12 TB');
	await expect(page.locator('#rd-tol')).toHaveText('1');
});

test('raid 6 with 6 x 2 TB gives 8 TB usable', async ({ page }) => {
	await page.goto('tools/raid-calculator/');
	await page.locator('#rd-count').fill('6');
	await page.locator('#rd-size').fill('2');
	await page.getByRole('button', { name: 'RAID 6', exact: true }).click();
	await expect(page.locator('#rd-usable')).toHaveText('8 TB');
	await expect(page.locator('#rd-tol')).toHaveText('2');
	await page.getByRole('button', { name: 'TiB (binary)' }).click();
	await expect(page.locator('#rd-usable')).toHaveText('7.28 TiB');
});

test('raid 10 rejects an odd number of disks', async ({ page }) => {
	await page.goto('tools/raid-calculator/');
	await page.locator('#rd-count').fill('5');
	await page.getByRole('button', { name: 'RAID 10', exact: true }).click();
	await expect(page.locator('#rd-error')).toContainText('even number');
});

test('tar create with gzip and its opposite', async ({ page }) => {
	await page.goto('tools/tar-command-builder/');
	await expect(page.locator('#tr-out')).toHaveText("tar -czf backup.tar.gz --exclude=node_modules --exclude='*.log' -C /var/www site uploads");
	await expect(page.locator('#tr-opp')).toHaveText('tar -xzf backup.tar.gz -C /var/www');
	await page.getByRole('button', { name: 'xz' }).click();
	await expect(page.locator('#tr-name')).toHaveValue('backup.tar.xz');
	await expect(page.locator('#tr-out')).toContainText('tar -cJf backup.tar.xz');
});

test('tar extract with strip-components', async ({ page }) => {
	await page.goto('tools/tar-command-builder/');
	await page.getByRole('button', { name: 'extract' }).click();
	await page.locator('#tr-strip').fill('1');
	await expect(page.locator('#tr-out')).toHaveText('tar -xzf backup.tar.gz -C /var/www --strip-components=1');
});

test('find builds a pruned command and warns on delete', async ({ page }) => {
	await page.goto('tools/find-command-builder/');
	await expect(page.locator('#fd-out')).toHaveText(
		"find . \\( -path ./node_modules -o -path ./.git \\) -prune -o -type f -name '*.log' -size +10M -mtime +30 -print",
	);
	await page.getByRole('button', { name: 'xargs -0' }).click();
	await expect(page.locator('#fd-out')).toContainText('-print0 | xargs -0 gzip -9');
	await page.getByRole('button', { name: 'delete' }).click();
	await expect(page.locator('#fd-warn')).toContainText('removes files for good');
});

test('rsync command and trailing slash explanation', async ({ page }) => {
	await page.goto('tools/rsync-command-builder/');
	await expect(page.locator('#rs-out')).toHaveText(
		"rsync -avzh --delete --dry-run --progress --partial -e 'ssh -p 2222 -i ~/.ssh/id_ed25519' --exclude=node_modules/ --exclude=.git/ --exclude='*.log' ./site/ deploy@example.com:/var/www/site",
	);
	await expect(page.locator('#rs-slash')).toContainText('contents of');
	await page.locator('#rs-src').fill('./site');
	await expect(page.locator('#rs-slash')).toContainText('/var/www/site/site/');
});

test('logrotate file and dry-run command', async ({ page }) => {
	await page.goto('tools/logrotate-generator/');
	const out = page.locator('#lr-out');
	await expect(out).toContainText('/var/log/nginx/*.log {');
	await expect(out).toContainText('rotate 14');
	await expect(out).toContainText('create 0640 www-data adm');
	await expect(out).toContainText('systemctl reload nginx');
	await expect(page.locator('#lr-cmd')).toContainText('sudo logrotate -d /etc/logrotate.d/nginx');
	await page.getByRole('button', { name: 'copytruncate' }).click();
	await expect(out).toContainText('copytruncate');
	await expect(out).not.toContainText('postrotate');
});

test('fstab ext4 line and nfs warnings', async ({ page }) => {
	await page.goto('tools/fstab-generator/');
	await expect(page.locator('#fs-out')).toContainText(/UUID=3f8a1c2e-5b7d-4e9a-8c61-2d4f0b9e7a13\s+\/mnt\/data\s+ext4\s+noatime,nofail\s+0\s+2/);
	await page.locator('#fs-type').selectOption('nfs');
	await expect(page.locator('#fs-out')).toContainText(/nas\.lan:\/export\/backups\s+\/mnt\/backups\s+nfs\s+\S*_netdev\S*\s+0\s+0/);
	await page.getByRole('button', { name: '_netdev' }).click();
	await expect(page.locator('#fs-warn')).toContainText('_netdev');
});

test('firewall warns when ssh is blocked and outputs all formats', async ({ page }) => {
	await page.goto('tools/firewall-rule-generator/');
	const out = page.locator('#fw-out');
	await expect(out).toContainText("sudo ufw allow in proto tcp from 203.0.113.0/24 to any port 22 comment 'SSH from office'");
	await expect(page.locator('#fw-warn')).toBeEmpty();
	await page.getByRole('button', { name: 'iptables' }).click();
	await expect(out).toContainText(':INPUT DROP [0:0]');
	await expect(out).toContainText('-A INPUT -p tcp -m multiport --dports 80,443 -m comment --comment "Web" -j ACCEPT');
	await page.getByRole('button', { name: 'nftables' }).click();
	await expect(out).toContainText('table inet filter {');
	await expect(out).toContainText('udp dport 51820 accept');
	await page.getByRole('button', { name: 'Remove rule 1' }).click();
	await expect(page.locator('#fw-warn')).toContainText('SSH (port 22)');
});
