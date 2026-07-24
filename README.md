# SmartDoc Review

![TypeScript](https://img.shields.io/badge/TypeScript-strict-7c6dfa?style=flat-square)
![Node](https://img.shields.io/badge/node-20+-f0a500?style=flat-square)

Monorepo for AI-powered document Q&A. Upload a PDF, ask questions, and get streamed answers grounded in your document — powered by **Google Gemini LLM** and **LangChain**.

## Structure

```
├── apps/
│   ├── api/        → Express.js + TypeScript backend
│   └── web/        → Next.js 14 frontend (coming soon)
├── docs/           → SRS, architecture
└── ...
```

## Quick Start

```bash
npm install
cp apps/api/.env.example apps/api/.env   # configure your env vars
npm run dev:api                           # start backend on port 4000
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev:api` | Start API dev server (hot reload) |
| `npm run build:api` | Compile API TypeScript |
| `npm run test:api` | Run API tests |
| `npm run start:api` | Start compiled API |

See [apps/api/README.md](apps/api/README.md) for the full API documentation.
