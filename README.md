<div align="center">

# 🛰️ RECON AI

**AI-powered software reverse engineering assistant**

Understand any codebase — instantly.

![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg)
![React](https://img.shields.io/badge/React-18-61DAFB.svg)
![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28.svg)

[Features](#-features) · [Quick start](#-quick-start) · [Firebase setup](#-firebase-setup) · [Deployment](#-deployment) · [Documentation](#-documentation)

</div>

---

## What is RECON AI?

RECON AI is a web application that turns any software project — a folder, ZIP archive, GitHub repository, APK, or executable — into a clear, plain-English intelligence report. It detects languages, frameworks, dependencies, entry points and security risks locally in your browser, then lets you optionally connect an AI provider for deep architectural explanations and project chat.

**Everything scanning runs on your device.** Only concise summaries and the files you explicitly ask about are ever sent to an AI provider.

---

## ✨ Features

- **📦 Multiple import sources** — Local folders (browser picker), ZIP archives, GitHub repositories, APK (binary AndroidManifest parsing), and EXE (static PE header parsing)
- **🧠 Local analysis engine** — 45+ languages, framework/runtime detection, dependency manifests (npm, pip, Cargo, Go, Maven, Gradle, Composer, Pub, NuGet, Gemfile), entry points, build systems
- **🔒 Heuristic security scan** — Secrets, private keys, JWTs, debug flags and `.env` exposure — all pattern-based, never executing code
- **🤖 AI assistance (optional)** — Architecture maps, code-quality reviews and a project chat via **OpenRouter** (Claude, GPT, Gemini…) or a **local Ollama** instance
- **🗺️ Mermaid architecture maps** — Lazy-loaded interactive diagrams
- **📤 Exports** — Markdown report, JSON dump, and print-to-PDF
- **🔐 Google sign-in** — Firebase Authentication + Firestore-backed dashboard with analysis history
- **⚡ Fully offline-capable heuristics** — Delivers value even before you configure any AI key

---

## 🚀 Quick start

```bash
# 1. Install dependencies
npm install

# 2. Configure Firebase (see below) — create .env from the template
cp .env.example .env

# 3. Run the dev server
npm run dev
```

Open http://localhost:5173 — the landing page loads immediately. Sign in with Google to access the workspace.

### Scripts

| Command            | Description                              |
| ------------------ | ---------------------------------------- |
| `npm run dev`      | Start the Vite dev server                |
| `npm run build`    | Type-check (`tsc`) and build for production |
| `npm run preview`  | Preview the production build locally     |

---

## 🔥 Firebase setup

RECON AI uses Firebase for authentication and persistence. You'll need a Firebase project:

1. Go to the [Firebase Console](https://console.firebase.google.com/) → **Add project**
2. **Authentication** → *Sign-in method* → enable **Google**
3. **Firestore Database** → *Create database* (production mode)
4. **Project settings** → *Your apps* → add a **Web app**, then copy the config values
5. Fill them into `.env` (copy from `.env.example`):

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

6. Deploy the included [Firestore security rules](firestore.rules):

```bash
firebase deploy --only firestore:rules
```

> 🔒 **Never commit your real `.env`.** The file is gitignored. `.env.example` ships with placeholder values.

---

## ☁️ Deployment

This project is configured for **Firebase Hosting** (see [firebase.json](firebase.json)):

```bash
npm run build          # produces dist/
firebase login
firebase deploy        # deploys hosting + rules
```

The SPA rewrite rule serves `index.html` for all routes, so deep links like `/dashboard` work after refresh.

---

## 🗂️ Project structure

```
src/
├── App.tsx                     # Routes (landing, login, dashboard, workspace)
├── components/
│   ├── ReconTool.tsx           # The main analysis workspace
│   ├── ImportDialog.tsx        # Import source picker (folder/zip/github/apk/exe)
│   ├── landing/                # Marketing pages (hero, features, security…)
│   └── ...
├── lib/
│   ├── providers.ts            # Import sources + local file readers
│   ├── recon/                  # Local analysis engine
│   │   ├── detect.ts           # Language / framework / entry-point detection
│   │   ├── deps.ts             # Dependency manifest parsers
│   │   ├── security.ts         # Heuristic security scan
│   │   ├── ai.ts               # AI provider abstraction (OpenRouter / Ollama)
│   │   ├── offline.ts          # Offline architecture & quality summaries
│   │   └── export.ts           # Markdown / JSON / print-to-PDF exports
│   ├── firebase.ts             # Firebase init
│   ├── auth.tsx                # Auth context (Google sign-in)
│   └── store.ts                # Local settings & history persistence
└── pages/
    ├── Landing.tsx             # Marketing landing
    ├── Login.tsx               # Sign-in page
    └── dashboard/              # Protected dashboard (Home, History, Settings, Profile)
```

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first, and review our [Code of Conduct](CODE_OF_CONDUCT.md).

- Report bugs and request features via [Issues](https://github.com/K1ngBronxo/RECON-AI/issues)
- Follow the pull request workflow in [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 🔒 Security

Found a vulnerability? Please **do not open a public issue**. See [SECURITY.md](SECURITY.md) for our responsible-disclosure process.

---

## 📄 License

RECON AI is licensed under the [Apache License 2.0](LICENSE).

© 2026 K1NG BRONXO. Built with React, Vite, TypeScript and Firebase.
