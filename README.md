# kodilo

A collection of open-source tools for developers without sign, account.

Live at **https://techmefr.github.io/kodilo/**

## What's in here

- **Inbox Tester** (`/tools/inbox-tester/`) — paste an HTML email, preview how it
  renders across Outlook Desktop, Outlook.com, Gmail, Apple Mail and Thunderbird
  (client CSS-support quirks are simulated, not pixel-perfect), and check a
  caniemail-style support grid for common CSS features.
- More tools land as separate categories in the sidebar — see `src/data/tools.ts`.

No sign-up, no account, no tracking. Every tool runs entirely client-side.

## Roadmap

Tools planned but not built yet, grouped by category (see `src/data/tools.ts`):

**JSON**
- JSON Formatter & Validator
- JSON to YAML
- JSON to CSV

**HTML / CSS**
- HTML Formatter
- CSS Formatter & Minifier
- Box Shadow Generator
- Gradient Generator

**Text**
- Regex Tester
- Diff Checker
- Case Converter
- Word Counter

**Encoding**
- Base64 Encoder & Decoder
- JWT Decoder
- URL Encoder & Decoder

**Generators**
- UUID Generator
- Password Generator
- QR Code Generator

**Testing** — not started
**Design** — not started

## Stack

- [Astro](https://astro.build) (static output)
- Deployed to GitHub Pages via GitHub Actions on every push to `main`

## Developing

```sh
npm install
npm run dev
```

| Command           | Action                                       |
| :----------------- | :-------------------------------------------- |
| `npm install`       | Install dependencies                          |
| `npm run dev`       | Start local dev server at `localhost:4321`    |
| `npm run build`     | Build the production site to `./dist/`        |
| `npm run preview`   | Preview the build locally before deploying    |

Node version is pinned via `.nvmrc` (`lts/*`).

## Adding a tool

1. Add the tool's metadata to `src/data/tools.ts` (under an existing or new category).
2. Create `src/pages/tools/<slug>.astro` using `src/layouts/Base.astro` and
   `src/components/Sidebar.astro` for the shared shell.
3. Keep it dependency-free and client-side — no sign-up, no server, no tracking.

## License

MIT
