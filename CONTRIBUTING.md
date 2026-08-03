# Contributing to RECON AI

First off, thank you for taking the time to contribute! 🎉

RECON AI is an open-source project licensed under the Apache License 2.0. All contributions — code, docs, bug reports, feature ideas — are welcome. By participating you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## Table of contents

- [Code of conduct](#code-of-conduct)
- [How to contribute](#how-to-contribute)
  - [Reporting bugs](#reporting-bugs)
  - [Requesting features](#requesting-features)
  - [Submitting code](#submitting-code)
- [Development workflow](#development-workflow)
- [Code style](#code-style)
- [Commit conventions](#commit-conventions)
- [Project layout](#project-layout)

---

## Code of conduct

Please review our [Code of Conduct](CODE_OF_CONDUCT.md). Harassment, discrimination, or disrespectful behavior of any kind will not be tolerated.

---

## How to contribute

### Reporting bugs

1. **Search** the existing [issues](https://github.com/K1ngBronxo/RECON-AI/issues) first — it may already be reported.
2. Open a new issue using the **Bug report** template.
3. Include:
   - Steps to reproduce
   - Expected vs. actual behavior
   - Browser/OS versions
   - Console errors or screenshots, if any

### Requesting features

1. Check existing issues and the [ROADMAP.md](ROADMAP.md) — the feature may already be planned.
2. Open a new issue using the **Feature request** template.
3. Explain the *problem you're trying to solve*, not just the solution. Context helps us design better.

### Submitting code

1. **Fork** the repository and create a branch from `main`:

   ```bash
   git checkout -b feat/your-feature
   ```

2. Make your changes with clear, focused commits (see [commit conventions](#commit-conventions)).
3. Make sure the project **builds cleanly**:

   ```bash
   npm install
   npm run build
   ```

4. Push your branch and open a **Pull Request** using the PR template.
5. Respond to review feedback. CI must pass before merge.

---

## Development workflow

```bash
npm install       # install dependencies
cp .env.example .env   # configure Firebase (see README)
npm run dev       # start dev server on http://localhost:5173
```

Local analysis features work without Firebase, but Google sign-in and the dashboard require a configured Firebase project (see the [README](README.md#firebase-setup)).

---

## Code style

- **TypeScript** with strict mode — no `any` unless unavoidable.
- **React** function components + hooks. No class components.
- **Tailwind CSS** utility classes for styling; follow existing patterns in neighboring components.
- Use **relative imports** and follow the existing folder conventions.
- Keep components focused; extract reusable logic into `src/lib/`.

---

## Commit conventions

We use conventional commit messages:

```
feat: add support for NuGet lockfile analysis
fix: prevent crash when scanning empty folders
docs: clarify Firebase setup steps
refactor: extract shared path helpers
chore: bump dependencies
```

Structure: `type(scope): description` — e.g. `fix(security): skip binary files in secret scan`.

---

## Project layout

See the [README](README.md#project-structure) for a full map of the codebase. In short:

| Path                  | Purpose                                  |
| --------------------- | ---------------------------------------- |
| `src/lib/recon/`      | Local analysis engine (detection, deps, security, AI) |
| `src/lib/providers.ts`| Import sources and file readers          |
| `src/components/`     | UI components (workspace, dialogs, landing) |
| `src/pages/`          | Route-level pages                        |

---

## Questions?

Open a [discussion](https://github.com/K1ngBronxo/RECON-AI/discussions) or reach out via issues. Happy hacking! 🛰️
