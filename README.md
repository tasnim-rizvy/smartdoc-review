# SmartDoc Review

![TypeScript](https://img.shields.io/badge/TypeScript-strict-7c6dfa?style=flat-square)
![Node](https://img.shields.io/badge/node-20+-f0a500?style=flat-square)

Monorepo for AI-powered document Q&A. Upload a PDF, ask questions, and get streamed answers grounded in your document — powered by **Google Gemini LLM** and **LangChain**.

## Structure

```
├── apps/
│   ├── api/        → Express.js + TypeScript backend
│   └── web/        → Next.js 14 frontend
├── docs/           → SRS, architecture
├── compose.yaml    → PostgreSQL, MongoDB, Redis (docker compose)
└── ...
```

## Quick Start

### 1. Start the databases (one command)

```bash
npm run db:up     # or: docker compose up -d
```

Starts **PostgreSQL** (5432), **MongoDB** (27017), and **Redis** (6379) containers with healthchecks. Data persists in named volumes.

### 2. Start the backend and frontend

```bash
npm install
cp apps/api/.env.example apps/api/.env   # configure your env vars
npm run dev:api                           # start backend on port 4000
npm run dev:web                           # start frontend on port 3000
```

Stop the databases anytime with `npm run db:down`.

## Scripts

| Command | Description |
|---|---|
| `npm run db:up` | Start PostgreSQL, MongoDB, Redis via docker compose |
| `npm run db:down` | Stop all database containers |
| `npm run dev:api` | Start API dev server (hot reload) |
| `npm run dev:web` | Start frontend dev server (port 3000) |
| `npm run build:api` | Compile API TypeScript |
| `npm run build:web` | Build frontend for production |
| `npm run test:api` | Run API tests |
| `npm run start:api` | Start compiled API |

See [apps/api/README.md](apps/api/README.md) for the full API documentation.
