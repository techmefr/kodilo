# kodilo

A collection of open-source tools for developers without sign, account.

Live at **https://techmefr.github.io/kodilo/**

## What's in here

- **Inbox Tester** (`/tools/inbox-tester/`) — paste an HTML email, preview how it
  renders across Outlook Desktop, Outlook.com, Gmail, Apple Mail and Thunderbird
  (client CSS-support quirks are simulated, not pixel-perfect), and check a
  caniemail-style support grid for common CSS features.
- **JSON Formatter** — JSON and JSON Lines (per-line errors, array ↔ JSONL conversion), format (2/4 spaces, tab), minify, sort keys, errors with line and column.
- **Base64** — UTF-8 safe encode/decode, URL-safe alphabet.
- **URL Encoder** — component or full-URL encode/decode, plus a breakdown of every URL part.
- **UUID Generator** — v4 or time-ordered v7, bulk up to 1000, uppercase, no hyphens.
- **Case Converter** — every case at once (camel, Pascal, snake, CONSTANT, kebab, dot, path, title…), click to copy.
- More tools land as separate categories in the sidebar — see `src/data/tools.ts`.

No sign-up, no account, no tracking. Every tool runs entirely client-side.

## Roadmap

Tools planned but not built yet, grouped by category (see `src/data/tools.ts`):

**JSON**
- JSON to YAML
- JSON to CSV
- JSON Diff
- JSON Viewer

**HTML / CSS**
- HTML Formatter
- CSS Formatter & Minifier
- Box Shadow Generator
- Gradient Generator
- CSS Grid Generator
- Flexbox Generator

**Markdown**
- Markdown to HTML
- Markdown Previewer

**SEO**
- Meta Tag Generator
- Open Graph Generator

**Text**
- Regex Tester
- Diff Checker
- Word Counter
- Slugify
- Lorem Ipsum Generator
- Text to Binary
- Text to NATO Alphabet
- Text Statistics
- Numeronym Generator

**Encoding & Security**
- JWT Decoder
- HTML Entities
- Hash Text
- HMAC Generator
- Bcrypt
- Basic Auth Generator
- Token Generator
- RSA Key Pair Generator
- Text Encryption
- BIP39 Generator
- XOR Cipher
- Checksum Calculator

**Generators**
- ULID Generator
- Password Generator
- QR Code Generator
- WiFi QR Code Generator
- Crontab Generator

**Converters**
- Date/Time Converter
- Color Converter
- Integer Base Converter
- Roman Numeral Converter
- Temperature Converter

**Network**
- IPv4 Subnet Calculator
- IPv4 Range Expander
- IPv6 ULA Generator
- MAC Address Generator
- MAC Address Lookup
- User Agent Parser
- HTTP Status Codes
- Phone Parser & Formatter

**Validators**
- Email Validator
- Credit Card Validator
- IBAN Validator & Parser

**Images**
- Image Resizer
- Image Compressor
- PNG to JPG Converter
- Image to Base64

**PDF**
- PDF Merge
- PDF Split
- PDF Compress
- PDF to JPG
- JPG to PDF

**Dev Utilities**
- SQL Prettify
- Math Evaluator
- Docker Run to Compose Converter
- MIME Types
- Chmod Calculator
- Regex Cheatsheet
- REST API Tester
- Docker Cheatsheet
- Git Cheatsheet
- NPM Cheatsheet

**Calculators**
- Developer Calculator
- Currency Converter
- Unit Converter

**Productivity**
- Pomodoro Timer

**Testing** — not started
**Design** — not started

Inspired partly by [it-tools](https://github.com/CorentinTh/it-tools),
[it-tools.tech](https://it-tools.tech/) (its live deployment), [devbench.site](https://devbench.site/),
[OpenFormatter](https://openformatter.com/tools), [productivite.loan-thomas.com](https://productivite.loan-thomas.com/)
and [CyberChef](https://github.com/gchq/CyberChef) — kodilo picks a subset and adds its own (Inbox Tester).

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
2. Create `src/pages/tools/<slug>.astro` wrapped in `src/components/ToolShell.astro`,
   reuse the shared `.panel`/`.seg`/`.btn` classes and the helpers in `src/scripts/ui.ts`
   (`onPage` so the tool re-initialises after client-side navigation), and set `built: true`.
3. Keep it client-side and dependency-free where practical — a small, well-maintained
   library (e.g. for PDF or image manipulation) is fine when a tool genuinely needs one.
   No sign-up, no server, no tracking either way.

## License

MIT
