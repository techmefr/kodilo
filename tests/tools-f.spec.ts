import { expect, test } from '@playwright/test';
import { parse } from 'yaml';

test('gitlab ci generator outputs stages, rules and a manual deploy', async ({ page }) => {
	await page.goto('tools/gitlab-ci-generator/');
	const out = page.locator('#gl-out');
	await expect(out).toContainText('stages:');
	await expect(out).toContainText('$CI_PIPELINE_SOURCE == "merge_request_event"');
	await expect(out).toContainText('when: manual');
	await expect(out).toContainText('- package-lock.json');
	await page.getByRole('radio', { name: 'Docker' }).click();
	await expect(out).toContainText('docker push "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA"');
	expect(parse((await out.textContent()) ?? '').build.script).toHaveLength(3);
	await page.getByRole('radio', { name: 'Pages' }).click();
	await expect(out).toContainText('publish: dist');
});

test('codeowners generator warns on shadowed patterns and bad owners', async ({ page }) => {
	await page.goto('tools/codeowners-generator/');
	await expect(page.locator('#co-out')).toContainText('/api/payments/ @acme/payments');
	await expect(page.locator('#co-warn')).toBeEmpty();
	await page.locator('#co-add').click();
	await page.getByLabel('Pattern 7').fill('*');
	await page.getByLabel('Owners 7').fill('not an owner');
	await expect(page.locator('#co-warn')).toContainText('never applies');
	await expect(page.locator('#co-warn')).toContainText('"not" is not a valid owner');
	await page.getByRole('radio', { name: 'GitLab' }).click();
	await expect(page.locator('#co-out')).toContainText('[Backend][2]');
	await expect(page.locator('#co-out')).toContainText('^[Docs]');
});

test('readme badge generator builds markdown and rst', async ({ page }) => {
	await page.goto('tools/readme-badge-generator/');
	const out = page.locator('#bd-out');
	await expect(out).toContainText('![made with love](https://img.shields.io/badge/made%20with-love-ff69b4?style=flat&logo=astro)');
	await expect(out).toContainText('https://img.shields.io/github/stars/withastro/astro');
	await page.getByRole('radio', { name: 'reStructuredText' }).click();
	await expect(out).toContainText('.. image:: https://img.shields.io/github/license/withastro/astro?style=flat');
	await expect(page.locator('#bd-preview img').first()).toHaveAttribute('alt', 'made with love');
});

test('issue template generator writes an issue form and a gitlab mr template', async ({ page }) => {
	await page.goto('tools/issue-pr-template-generator/');
	await expect(page.locator('#it-file')).toHaveText('.github/ISSUE_TEMPLATE/bug-report.yml');
	await expect(page.locator('#it-out')).toContainText('name: Bug report');
	await expect(page.locator('#it-out')).toContainText('type: dropdown');
	await page.getByRole('radio', { name: 'GitLab MR' }).click();
	await expect(page.locator('#it-file')).toHaveText('.gitlab/merge_request_templates/default.md');
	await expect(page.locator('#it-out')).toContainText('/label ~bug ~triage');
});

test('conventional commit builder adds breaking footer and parses a major bump', async ({ page }) => {
	await page.goto('tools/conventional-commit-builder/');
	await expect(page.locator('#cc-out')).toContainText('feat(auth): refresh tokens before they expire');
	await expect(page.locator('#cc-out')).toContainText('Closes #123');
	await page.locator('#cc-breaking').check();
	await expect(page.locator('#cc-out')).toContainText('feat(auth)!: refresh tokens');
	await expect(page.locator('#cc-out')).toContainText('BREAKING CHANGE:');
	await expect(page.locator('#cc-cmd')).toContainText("git commit -F - <<'EOF'");
	await page.locator('#cc-subject').fill('Added things.');
	await expect(page.locator('#cc-warn')).toContainText('imperative mood');
	await page.getByRole('radio', { name: 'Parse' }).click();
	await expect(page.locator('#cc-bump')).toHaveText('major');
	await page.locator('#cc-in').fill('fix: handle empty input');
	await expect(page.locator('#cc-bump')).toHaveText('patch');
	await page.locator('#cc-in').fill('feat: add search');
	await expect(page.locator('#cc-bump')).toHaveText('minor');
	await page.locator('#cc-in').fill('added search');
	await expect(page.locator('#cc-issues-list')).toContainText('Header must look like');
});

test('git undo guide shows commands and filters situations', async ({ page }) => {
	await page.goto('tools/git-undo-guide/');
	await expect(page.locator('#gu-steps')).toContainText('git reset --soft HEAD~1');
	await expect(page.locator('#gu-badge')).toBeVisible();
	await page.locator('#gu-search').fill('reflog');
	await expect(page.locator('#gu-title')).toHaveText('Recover a deleted branch');
	await expect(page.locator('#gu-steps')).toContainText('git switch -c feature/login <commit>');
	await expect(page.locator('#gu-badge')).toBeHidden();
	await page.locator('#gu-search').fill('rename');
	await page.locator('#gu-remote').fill('upstream');
	await expect(page.locator('#gu-steps')).toContainText('git push upstream -u feature/login');
});
