# kodilo

A collection of open-source tools for developers with no sign-up and no account.

Live at **https://techmefr.github.io/kodilo/**

## What's in here

- **Inbox Tester** (`/tools/inbox-tester/`) — paste an HTML email, preview how it
  renders across Outlook Desktop, Outlook.com, Gmail, Yahoo Mail, Apple Mail and Thunderbird
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
- **JSON to TypeScript** (`/tools/json-to-typescript/`) — interfaces or types, merged arrays, optional keys
- **JSON Schema Validator** (`/tools/json-schema-validator/`) — draft-07 and 2020-12, errors with paths, schema from a sample
- **XML Formatter** (`/tools/xml-formatter/`) — format or minify, errors with line numbers
- **TOML Formatter & Converter** (`/tools/toml-formatter/`) — format, TOML to JSON and back
- **GraphQL Formatter** (`/tools/graphql-formatter/`) — queries, fragments and schemas, format or minify
- **HTML to Markdown** (`/tools/html-to-markdown/`) — headings, lists, code blocks and tables, rich text paste
- **URL Parser** (`/tools/url-parser/`) — every part editable, query parameters as a table
- **String Escaper** (`/tools/string-escaper/`) — JSON, JS, SQL, shell, regex, CSV, HTML both ways
- **WCAG Contrast Checker** (`/tools/wcag-contrast-checker/`) — AA/AAA ratios, preview, nearest passing color
- **px, rem & em Converter** (`/tools/px-rem-converter/`) — any root size, scale table, CSS px to rem
- **Cubic Bezier Editor** (`/tools/cubic-bezier-editor/`) — drag handles, presets, animated preview against linear
- **Image Color Palette** (`/tools/image-color-palette/`) — dominant colors with shares, CSS variables export
- **Favicon Generator** (`/tools/favicon-generator/`) — ico, PNG sizes, Apple icon, manifest and HTML as a zip
- **SVG Optimizer** (`/tools/svg-optimizer/`) — SVGO in the browser, precision, before/after preview
- **WebP & AVIF Converter** (`/tools/webp-avif-converter/`) — WebP, AVIF, JPG and PNG with size comparison
- **EXIF Viewer & Remover** (`/tools/exif-viewer/`) — camera, date and GPS shown, clean copy without metadata
- **QR Code Reader** (`/tools/qr-code-reader/`) — image, paste or camera, WiFi and 2FA codes explained
- **TOTP / 2FA Generator** (`/tools/totp-generator/`) — live codes, check a code, otpauth URI and QR
- **JWT Generator** (`/tools/jwt-generator/`) — HS256/HS512/RS256/ES256, expiry, key pairs, verify
- **CSP Generator** (`/tools/csp-generator/`) — presets, per-directive fields, warnings, header/meta/Nginx/Apache
- **robots.txt Generator** (`/tools/robots-txt-generator/`) — rules per crawler, AI bot blocking, path tester
- **Sitemap Generator** (`/tools/sitemap-generator/`) — paths or URLs, lastmod, changefreq, priority by depth
- **Redirect Generator** (`/tools/redirect-generator/`) — Nginx, .htaccess, Netlify, Vercel and Caddy with wildcards
- **Unicode Inspector** (`/tools/unicode-inspector/`) — code points, UTF-8 bytes, escapes, invisible characters
- **Keyboard Event Info** (`/tools/keycode-info/`) — key, code, keyCode, modifiers and a handler snippet
- **Aspect Ratio Calculator** (`/tools/aspect-ratio-calculator/`) — ratio, resize, common formats and CSS
- **JavaScript Formatter & Minifier** (`/tools/javascript-formatter/`) — Prettier beautify and Terser minify for JS/TS
- **CSV to JSON** (`/tools/csv-to-json/`) — CSV to JSON with delimiter detection and typed values
- **JSONPath Tester** (`/tools/jsonpath-tester/`) — live JSONPath queries with matched paths
- **Fake Data Generator** (`/tools/fake-data-generator/`) — seeded fake records as JSON, CSV or SQL
- **Mermaid Live Editor** (`/tools/mermaid-editor/`) — live Mermaid diagram editor with SVG export
- **Time Zone Converter** (`/tools/timezone-converter/`) — a date-time across any time zones, DST-aware
- **Line Tools** (`/tools/line-tools/`) — sort, dedupe, filter and number lines
- **Base32, Base58 & Hex Encoder** (`/tools/base-encoder/`) — Base32, Base58 and hex encoding with character codes
- **Markdown Table Generator** (`/tools/markdown-table-generator/`) — editable grid or CSV to an aligned Markdown table
- **Color Shades Generator** (`/tools/color-shades-generator/`) — OKLCH shade scale from 50 to 950 with contrast ratios
- **HTTP Headers & Cookie Parser** (`/tools/http-headers-parser/`) — explain raw HTTP headers, Set-Cookie and Cookie
- **License Generator** (`/tools/license-generator/`) — MIT, Apache, GPL, BSD, ISC, MPL and Unlicense files
- **CSR Generator** (`/tools/csr-generator/`) — PKCS#10 CSR and private key, generated in the browser
- **Code Screenshot** (`/tools/code-screenshot/`) — beautiful code images as PNG
- **Placeholder Image Generator** (`/tools/placeholder-image-generator/`) — placeholder images, data URIs and SVG
- **GitHub Actions Workflow Generator** (`/tools/github-actions-generator/`) — CI workflows with matrix, cache and pinned actions
- **Dockerfile Generator & Linter** (`/tools/dockerfile-generator/`) — multi-stage Dockerfiles and a best-practice linter
- **Docker Compose Validator** (`/tools/docker-compose-validator/`) — compose syntax and semantic checks with a service summary
- **Kubernetes Secret Encoder** (`/tools/kubernetes-secret-encoder/`) — Secret YAML from key/values, TLS or registry credentials, and back
- **Caddyfile Generator** (`/tools/caddyfile-generator/`) — Caddyfiles with proxy, static files, headers and auth
- **CIDR Aggregator & Splitter** (`/tools/cidr-aggregator/`) — merge, exclude and split IPv4 CIDR blocks
- **Firewall Rule Generator** (`/tools/firewall-rule-generator/`) — ufw, iptables and nftables from one rule list, with an SSH lockout warning
- **Logrotate Config Generator** (`/tools/logrotate-generator/`) — logrotate.d files explained line by line
- **fstab Entry Generator** (`/tools/fstab-generator/`) — aligned fstab lines with _netdev/nofail and pass checks
- **RAID Calculator** (`/tools/raid-calculator/`) — RAID capacity and fault tolerance in TB or TiB
- **rsync Command Builder** (`/tools/rsync-command-builder/`) — rsync flags, SSH options and the trailing slash explained
- **find Command Builder** (`/tools/find-command-builder/`) — find with prune, -exec and xargs -0, explained
- **tar Command Builder** (`/tools/tar-command-builder/`) — tar create, extract and list with the reverse command
- **GitLab CI Generator** (`/tools/gitlab-ci-generator/`) — pipelines for Node, Python, Go, Docker or GitLab Pages
- **CODEOWNERS Generator** (`/tools/codeowners-generator/`) — code owners with sections and order checks
- **README Badge Generator** (`/tools/readme-badge-generator/`) — shields.io badges with GitHub and GitLab presets
- **Issue & PR Template Generator** (`/tools/issue-pr-template-generator/`) — issue forms and PR/MR templates
- **Conventional Commit Builder** (`/tools/conventional-commit-builder/`) — build and validate commit messages, predict the semver bump
- **Git Undo Guide** (`/tools/git-undo-guide/`) — the right command to undo almost anything in Git
- **Docker Command Explainer** (`/tools/docker-command-explainer/`) — explain any docker command, flag by flag
- **Docker Compose Visualizer** (`/tools/docker-compose-visualizer/`) — compose.yaml as a diagram of services, networks and volumes
- **Dockerfile Layer Visualizer** (`/tools/dockerfile-layer-visualizer/`) — stages, layers and cache invalidation of a Dockerfile
- **Docker Container Lifecycle** (`/tools/docker-container-lifecycle/`) — interactive container state diagram and simulator
- Find any tool from the sidebar mega menu or the ⌘K / Ctrl K search. Ideas for new ones are welcome as issues.

No sign-up, no account, no tracking. Every tool runs entirely client-side.

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

| Command           | Action                                     |
| :---------------- | :----------------------------------------- |
| `npm install`     | Install dependencies                       |
| `npm run dev`     | Start local dev server at `localhost:4321` |
| `npm run build`   | Build the production site to `./dist/`     |
| `npm run preview` | Preview the build locally before deploying |

Node version is pinned via `.nvmrc` (`lts/*`).

## Adding a tool

1. Add the tool's metadata to `src/data/tools.ts` (under an existing or new category).
2. Create `src/pages/tools/<slug>.astro` wrapped in `src/components/ToolShell.astro`,
   reuse the shared `.panel`/`.seg`/`.btn` classes and the helpers in `src/scripts/ui.ts`
   (`onPage` so the tool re-initialises after client-side navigation), and set `built: true`.
3. Keep it client-side and dependency-free where practical — a small, well-maintained
   library (e.g. for PDF or image manipulation) is fine when a tool genuinely needs one.
   No sign-up, no server, no tracking either way.

## Contributing

Issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) first, and report security problems as described in [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)
