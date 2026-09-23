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
- JSON Diff
- JSON Viewer

**HTML / CSS**
- HTML Formatter
- CSS Formatter & Minifier
- Box Shadow Generator
- Gradient Generator

**Markdown**
- Markdown to HTML
- Markdown Previewer

**SEO**
- Meta Tag Generator
- Open Graph Generator

**Text**
- Regex Tester
- Diff Checker
- Case Converter
- Word Counter
- Slugify
- Lorem Ipsum Generator
- Text to Binary
- Text to NATO Alphabet
- Text Statistics
- Numeronym Generator

**Encoding & Security**
- Base64 Encoder & Decoder
- JWT Decoder
- URL Encoder & Decoder
- HTML Entities
- Hash Text
- HMAC Generator
- Bcrypt
- Basic Auth Generator
- Token Generator
- RSA Key Pair Generator
- Text Encryption
- BIP39 Generator

**Generators**
- UUID Generator
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

**Testing** — not started
**Design** — not started

Inspired partly by [it-tools](https://github.com/CorentinTh/it-tools), [devbench.site](https://devbench.site/),
[OpenFormatter](https://openformatter.com/tools) and other no-signup dev tool
collections — kodilo picks a subset and adds its own (Inbox Tester).

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
3. Keep it client-side and dependency-free where practical — a small, well-maintained
   library (e.g. for PDF or image manipulation) is fine when a tool genuinely needs one.
   No sign-up, no server, no tracking either way.

## License

MIT
