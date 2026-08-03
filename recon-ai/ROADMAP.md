# Roadmap

A living document describing where RECON AI is heading. Items are
re-prioritized as the project evolves — this is a plan, not a promise.

Legend: ✅ shipped · 🔜 in progress · 💡 planned · 🤔 exploring

---

## Current milestone — Web-first (v1.x)

- [x] ✅ Strip the desktop (Tauri) shell — pure browser experience
- [x] ✅ Local folder import via the browser File System Access API
- [x] ✅ ZIP / APK / EXE / GitHub import
- [x] ✅ Offline analysis heuristics (no AI key required)
- [x] ✅ GitHub Actions CI: typecheck + build on every push/PR
- [ ] 🔜 End-to-end smoke tests for the import → analyze → export flow

## v1.x — Hardening & polish

- [ ] 💡 PWA support (offline caching, installable web app)
- [ ] 💡 Drag-and-drop for multiple sources at once
- [ ] 💡 Inline file viewer with syntax highlighting inside the workspace
- [ ] 💡 Deeper dependency insights (vulnerability lookups via OSV API)
- [ ] 💡 Analysis comparison / diff between two projects
- [ ] 💡 Shareable read-only report links
- [ ] 💡 Telemetry-light usage analytics (opt-in)

## v2.0 — Intelligence

- [ ] 💡 Multi-file AI context: ask questions across your whole codebase
- [ ] 💡 RAG-style semantic search over imported projects
- [ ] 💡 Structured export for external tools (SARIF, SBOM)
- [ ] 💡 Team workspaces with shared analysis history
- [ ] 🤔 Automated "explain this PR" diffs

## v3.0 — Scale

- [ ] 🤔 Server-side scanning for very large repositories
- [ ] 🤔 Managed AI keys (bring-your-own-key + hosted tiers)
- [ ] 🤔 Native mobile companion

---

## How to influence the roadmap

Open a [feature request](https://github.com/K1ngBronxo/RECON-AI/issues) or a
[discussion](https://github.com/K1ngBronxo/RECON-AI/discussions). Items with the
most community interest get prioritized first.
