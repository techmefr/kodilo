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
- **Lorem Ipsum** — 14 corpora: Latin, French accents, Malagasy long words, German compounds, Cyrillic,
  Arabic (RTL), Japanese (no spaces), emoji and ZWJ sequences, an all-scripts stress test, plus cat, dog,
  Elvish, pirate and robot. Paragraphs, sentences or words, as text or HTML.
- **Word Counter** — words, characters (grapheme-aware), UTF-8 bytes, sentences, reading and speaking time, top keywords.
- **Slugify** — URL slugs with transliteration, custom separator and max length, one per line.
- **Text to Binary** — UTF-8 bytes as binary, hex, octal or decimal, both ways.
- **NATO Alphabet** — spell text out, with optional ICAO digit pronunciation.
- **Numeronym Generator** — internationalization → i18n.
- **HTML Entities** — escape and unescape, optional non-ASCII encoding, common entities reference.
- **Roman Numerals** — both ways with strict validation and a breakdown.
- **Temperature** — Celsius, Fahrenheit, Kelvin and Rankine, with presets.
- **Integer Base Converter** — bases 2 to 36, arbitrary precision, negatives.
- **Hash** — MD5, SHA-1, SHA-256, SHA-384 and SHA-512 of text or a file, hex or Base64.
- **HMAC Generator** — SHA-1/256/384/512 signatures with a compare field for webhook checks.
- **Password Generator** — unbiased crypto randomness, character sets, look-alike exclusion, entropy meter.
- **Token Generator** — alphanumeric, hex or base64url tokens with optional prefix, in bulk.
- **ULID Generator** — monotonic ULIDs in bulk, and timestamp decoding.
- **JWT Decoder** — header and payload, iat/nbf/exp as readable dates with expiry status, alg:none warning.
- **Basic Auth** — build the Authorization header and curl command, or decode one.
- **Chmod Calculator** — permission grid, octal, symbolic, setuid/setgid/sticky, common presets.
- **HTTP Status Codes** — searchable and filterable by class.
- **Credit Card Validator** — Luhn check, network detection, formatting, test card numbers.
- **IBAN Validator** — mod-97 checksum, per-country length, country, check digits and BBAN.
- **Email Validator** — bulk syntax checks, typo suggestions for popular domains, disposable providers.
- **Date & Time Converter** — Unix seconds/ms/µs, ISO and date strings to every format, in any time zone.
- **Color Converter** — any CSS color to HEX, RGB, HSL, HWB, OKLCH and CMYK, with WCAG contrast.
- **IPv4 Subnet Calculator** — network, broadcast, host range, masks, address type, binary.
- **Regex Tester** — live highlighting, flags, capture and named groups, replace preview.
- **Box Shadow Generator** — multiple layers, presets, live preview.
- **Gradient Generator** — linear, radial and conic with any number of stops.
- **JSON to CSV** — arrays or JSON Lines, flattened keys, delimiter choice, preview and download.
- **Image to Base64** — drop, pick or paste; data URI, raw, CSS, HTML or Markdown.
- **Uptime / SLA Calculator** (`/tools/uptime-sla-calculator/`) — availability targets to downtime budgets, composite SLAs
- **Byte Size Converter** (`/tools/byte-size-converter/`) — decimal and binary units side by side
- **Transfer Time Calculator** (`/tools/transfer-time-calculator/`) — transfer duration and bandwidth needed for a deadline
- **Kubernetes Resource Units** (`/tools/kubernetes-resource-units/`) — CPU millicores and memory Mi vs M, resources block
- **Well-Known Ports** (`/tools/well-known-ports/`) — searchable TCP/UDP port reference
- **Linux Signals & Exit Codes** (`/tools/linux-signals-exit-codes/`) — decode exit codes like 137 and a signal table
- **.gitignore Generator** (`/tools/gitignore-generator/`) — pick a stack, get a deduplicated .gitignore
- **SemVer Calculator** (`/tools/semver-calculator/`) — range matching, sorting and next versions
- **DNS Record Builder** (`/tools/dns-record-builder/`) — zone file lines for A, MX, SPF, DMARC, CAA, SRV and more
- **Security Headers Builder** (`/tools/security-headers-builder/`) — HSTS, CSP and friends for Nginx, Apache, Caddy, Netlify
- **IPv4 Range Expander** (`/tools/ipv4-range-expander/`) — expand a CIDR or range into addresses and minimal CIDR blocks
- **IPv6 ULA Generator** (`/tools/ipv6-ula-generator/`) — random RFC 4193 prefix and /64 subnets
- **Text Statistics** (`/tools/text-statistics/`) — reading time, readability, lexical diversity and top words
- **XOR Cipher** (`/tools/xor-cipher/`) — repeating-key XOR with text, hex and Base64
- **Checksum Calculator** (`/tools/checksum-calculator/`) — CRC32, CRC32C, Adler-32, FNV-1a and SHA-256 with verification
- **MAC Address Generator** (`/tools/mac-address-generator/`) — random MACs with prefix, separator and case options
- **User Agent Parser** (`/tools/user-agent-parser/`) — browser, engine, OS and device from a User-Agent
- **MIME Types** (`/tools/mime-types/`) — extension to Content-Type and back
- **Regex Cheatsheet** (`/tools/regex-cheatsheet/`) — JavaScript regex syntax, click to copy
- **.env Tool** (`/tools/env-file-tool/`) — validate, diff with .env.example, export to JSON, docker, Compose, Secret
- **systemd Unit Generator** (`/tools/systemd-unit-generator/`) — service and timer units with hardening
- **SSH Config Generator** (`/tools/ssh-config-generator/`) — Host blocks with jump hosts and forwarding
- **Meta Tag Generator** (`/tools/meta-tag-generator/`) — title, description, robots, icons with a search preview
- **Open Graph Generator** (`/tools/open-graph-generator/`) — Open Graph and Twitter cards with a link preview
- **Crontab Generator** (`/tools/crontab-generator/`) — cron in plain English and the next runs
- **Docker Run to Compose Converter** (`/tools/docker-run-to-compose/`) — docker run command to a compose.yaml service
- **curl Converter** (`/tools/curl-converter/`) — curl to fetch, axios, Python, HTTPie or PHP
- **JSON Log Viewer** (`/tools/json-log-viewer/`) — filter structured logs by level and field
- **Unit Converter** (`/tools/unit-converter/`) — length, mass, speed, area, volume, time, pressure, energy, power
- **Pomodoro Timer** (`/tools/pomodoro-timer/`) — focus and break intervals with sound
- **Image Resizer** (`/tools/image-resizer/`) — resize by pixels or percentage, PNG/JPG/WebP
- **PNG to JPG Converter** (`/tools/png-to-jpg/`) — batch PNG to JPG with quality and background
- **JSON to YAML** (`/tools/json-to-yaml/`) — safe quoting, block strings, JSON Lines as multi-doc
- **JSON Diff** (`/tools/json-diff/`) — structural diff with paths, optional unordered arrays
- **JSON Viewer** (`/tools/json-viewer/`) — collapsible tree, search, click to copy a path
- **Diff Checker** (`/tools/diff-checker/`) — line and word diff, split or unified
- **Flexbox Generator** (`/tools/flexbox-generator/`) — visual flex container and per-item settings
- **CSS Grid Generator** (`/tools/css-grid-generator/`) — tracks, gaps and drag-painted named areas
- **Text Encryption** (`/tools/text-encryption/`) — AES-256-GCM with a PBKDF2 passphrase
- **RSA Key Pair Generator** (`/tools/rsa-key-pair-generator/`) — PEM or JWK, 2048 to 4096 bits
- **Image Compressor** (`/tools/image-compressor/`) — quality, max width, before/after slider
- **Git Cheatsheet** (`/tools/git-cheatsheet/`) — commands by task, click to copy
- **Docker Cheatsheet** (`/tools/docker-cheatsheet/`) — containers, images, compose, cleanup
- **NPM Cheatsheet** (`/tools/npm-cheatsheet/`) — npm, pnpm, Yarn and Bun side by side
- **Markdown to HTML** (`/tools/markdown-to-html/`) — GFM to HTML, tables, tasks, anchors
- **Markdown Previewer** (`/tools/markdown-previewer/`) — live preview, outline, saved draft
- **CSS Formatter & Minifier** (`/tools/css-formatter/`) — beautify or minify CSS
- **SVG to JSX, TSX & Vue** (`/tools/svg-to-component/`) — React or Vue component with size and color props
- **HTML Formatter** (`/tools/html-formatter/`) — beautify or minify HTML
- **SQL Prettify** (`/tools/sql-prettify/`) — one clause per line, keyword case
- **Math Evaluator** (`/tools/math-evaluator/`) — calculator notepad with variables
- **Kubernetes Manifest Generator** (`/tools/kubernetes-manifest-generator/`) — Deployment, Service and Ingress YAML
- **Nginx Config Generator** (`/tools/nginx-config-generator/`) — proxy, SPA, static or PHP with HTTPS
- **Bcrypt** (`/tools/bcrypt/`) — hash and verify passwords, adjustable cost
- **QR Code Generator** (`/tools/qr-code-generator/`) — text or URL to QR, PNG or SVG download
- **WiFi QR Code Generator** (`/tools/wifi-qr-code-generator/`) — scan-to-join QR card, printable
- **htpasswd Generator** (`/tools/htpasswd-generator/`) — bcrypt or SHA lines plus Nginx/Apache config
- **YAML Validator & Formatter** (`/tools/yaml-validator/`) — line and column errors, format, YAML to JSON
- **REST API Tester** (`/tools/rest-api-tester/`) — send requests, status, timing, headers, body
- **Phone Parser & Formatter** (`/tools/phone-parser/`) — validity, country, line type, E.164 and more
- **Developer Calculator** (`/tools/developer-calculator/`) — hex/dec/oct/bin with bitwise ops and bit grid
- **PDF Merge** (`/tools/pdf-merge/`) — combine and reorder PDFs in the browser
- **JPG to PDF** (`/tools/jpg-to-pdf/`) — images to a PDF, A4, Letter or fit
- **Currency Converter** (`/tools/currency-converter/`) — ECB daily rates, 30 currencies
- **BIP39 Generator** (`/tools/bip39-generator/`) — generate or check a mnemonic, entropy and seed
- **MAC Address Lookup** (`/tools/mac-address-lookup/`) — vendor from the bundled IEEE OUI registry
- **PDF Split** (`/tools/pdf-split/`) — extract a page range or one file per page
- **PDF Compress** (`/tools/pdf-compress/`) — lossless repack or pages as JPEG
- **PDF to JPG** (`/tools/pdf-to-jpg/`) — render pages as JPG or PNG at 72-300 DPI
- **X.509 Certificate Decoder** (`/tools/x509-certificate-decoder/`) — subject, SANs, validity, key, fingerprints
- More tools land as new categories in the sidebar mega menu and the ⌘K / Ctrl K search — see `src/data/tools.ts`.

No sign-up, no account, no tracking. Every tool runs entirely client-side.

## Roadmap

Tools planned but not built yet, grouped by category (see `src/data/tools.ts`):

**JSON**

**HTML / CSS**

**Markdown**

**SEO**

**Text**

**Encoding & Security**

**Generators**

**Converters**

**Network**

**Validators**

**Images**

**PDF**

**Dev Utilities**

**DevOps & Sysadmin**

**Calculators**

**Productivity**

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
