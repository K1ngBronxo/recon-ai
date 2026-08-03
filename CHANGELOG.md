# Changelog

All notable changes to RECON AI are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- (planned) See [ROADMAP.md](ROADMAP.md) for upcoming work.

## [1.0.0] - 2026-08-03

First production release. RECON AI is now a pure **web application** — the
Tauri desktop shell and Windows installer have been removed.

### Added
- **Import sources**: local folder (browser picker), ZIP archive, GitHub
  repository, APK (binary AndroidManifest string-pool parsing), EXE (static PE
  header parsing) — all running entirely in the browser
- **Local analysis engine**: 45+ languages, framework/runtime detection,
  dependency manifests (npm, pip, Cargo, Go, Maven, Gradle, Composer, Pub,
  pyproject, Pipfile, NuGet, Gemfile), entry points, build systems
- **Heuristic security scan**: secrets, private keys, JWTs, debug flags, `.env`
  exposure — pattern-based only, no code execution
- **AI assistance** via OpenRouter (Claude, GPT, Gemini) or local Ollama:
  architecture summaries, code-quality reviews, project chat
- **Mermaid architecture maps** (lazy-loaded for fast startup)
- **Exports**: Markdown report, JSON dump, print-to-PDF
- **Web companion**: premium landing page, Google sign-in, protected dashboard
  with analysis history (Firebase Auth + Firestore)
- **Offline heuristics**: architecture & quality summaries work with no AI key
- **Firebase Hosting deployment** config with SPA rewrite rules

### Changed
- Removed the Tauri desktop shell, NSIS installer and portable EXE builds —
  RECON AI now runs entirely in the browser
- Dev server port moved from `1420` to `5173` (Vite default)

### Security
- Production hardened with Content-Security-Policy guidance, strict Firestore
  rules, and path containment for all file handling
- Input parsing hardened against malformed archives and binaries
