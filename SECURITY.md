# Security Policy

RECON AI takes security seriously. This document outlines how to report
vulnerabilities and the support expectations for security fixes.

## Reporting a Vulnerability

**Please do not open a public issue for security vulnerabilities.**

Instead, report them privately so they can be fixed before disclosure. Use the
GitHub **Security Advisories** feature ("Report a vulnerability" button on the
repository's *Security* tab), or contact the maintainers directly.

When reporting, please include:

- A clear description of the vulnerability and its impact
- Steps to reproduce (minimal repro preferred)
- Affected versions and environments (browser, OS)
- Any suggested mitigation, if known

You can expect:

- **Acknowledgement** of your report within 48 hours
- A status update within 5 business days
- Coordinated disclosure: we will work with you to confirm the fix and plan a
  public release before details are disclosed

We ask that researchers do not publicly disclose details until we have shipped
a fix and given the all-clear.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | ✅ Active          |
| < 1.0   | ❌ Not supported   |

## Scope

Security-sensitive areas of this project include:

- **Firestore security rules** (`firestore.rules`) — user data isolation
- **Firebase Authentication** flows — session handling and sign-in
- **Markdown rendering** (`dompurify` + `marked`) — XSS resistance
- **Import parsing** (ZIP/APK/EXE) — malformed-file resilience
- **AI provider communication** — API keys and payload handling

### In scope (static analysis)

RECON AI is a *static analysis* tool. It does not execute scanned binaries, so
common reverse-engineering concerns (code execution during analysis) are
outside the threat model. We still harden parsers against malformed inputs.

## Security Best Practices for Users

- Never commit your `.env` file — it contains Firebase configuration.
- Only analyze code you are authorized to inspect.
- Treat heuristic findings (secrets, markers) as *signals*, not facts — verify
  before acting on them.

## Recognition

We are grateful to researchers who report responsibly. With your permission,
we'll add you to a public acknowledgements list.
