# Security policy

kodilo is a static site. Tools run in your browser and do not send your data anywhere, unless a tool's description says it calls an external API.

## Reporting a vulnerability

Please do not open a public issue. Report it privately through [GitHub security advisories](https://github.com/techmefr/kodilo/security/advisories/new).

Include the tool, the steps to reproduce and what an attacker could do. You will get an answer within a week, and credit in the fix if you want it.

## In scope

- Cross-site scripting or HTML injection through tool input
- A tool sending user input to a server without saying so
- Weak randomness in generators (passwords, tokens, keys, mnemonics)
- Compromised or malicious dependencies
