# Contributing to kodilo

Thanks for helping. kodilo is a set of small developer tools that run entirely in the browser: no account, no tracking, no data sent anywhere unless the tool says so.

## Ground rules

- Everything is written in English: code, UI text, commits, issues, pull requests and docs.
- No code comments. Names and small functions should explain the code.
- Every tool works offline once loaded, except tools whose job is a network call (REST API Tester, Currency Converter). Say so in the description when a tool talks to a server.
- Never upload user input. Files, text and keys stay in the browser.
- Be kind. See the [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting started

```bash
nvm use
npm ci
npm run dev
```

The site runs at http://localhost:4321/kodilo/. Before opening a pull request, make sure these pass, as CI runs the same steps:

```bash
npm run format:check
npm run lint
npm run check
npm run build
npm run budget
npm run test:install
npm test
npm run test:a11y
```

`npm test` runs Playwright: every tool page is loaded on desktop, mobile and dark mode, and must render with no console error and no horizontal scroll. Every page is also audited with axe for WCAG 2.1 AA, in light and dark mode. `npm run budget` fails when a bundle grows past its size limit. Add a functional test in `tests/tools.spec.ts` when your tool computes something with a known answer.

## Adding a tool

1. Add or find the tool in `src/data/tools.ts` with a `slug`, `name`, `description` and a [Lucide](https://lucide.dev/icons/) `icon` name. Set `built: true` only when the page is ready.
2. Create `src/pages/tools/<slug>.astro` using `ToolShell`. One file per tool; shared helpers go in `src/scripts/`.
3. Reuse the shared building blocks: `panel`, `fields`, `seg` segmented controls, `btn`, `stats` from `src/styles/global.css`, and `byId`, `copyButton`, `segmented`, `onPage` from `src/scripts/ui.ts`.
4. Open the page with a realistic example already filled in, update results live as the user types, and show a "Copied" state on copy buttons.
5. Check the page at phone width (375px) and in both light and dark themes.
6. Add the tool to "What's in here" in the README.

## Commits and pull requests

- Use [Conventional Commits](https://www.conventionalcommits.org/) with a lowercase description: `feat: add toml formatter`, `fix: keep leading zeros in hex output`.
- Keep one topic per pull request. Pull requests are squash merged.
- Fill in the pull request template, including how you tested the change.
- `main` is protected: changes land through a reviewed pull request with a green CI build.

## Reporting bugs and ideas

Use the issue templates. For security problems, follow [SECURITY.md](SECURITY.md) instead of opening a public issue.
