# SmartDoc Review — Backend API

Production-ready REST API for AI-powered document Q&A. Upload a PDF, ask questions, and get streamed answers grounded in your document — powered by **Google Gemini LLM**, built with **LangChain** for RAG pipelines, and leveraging **Google AI APIs** for embeddings and generation. Features full audit logging, JWT auth, and per-user rate limiting.

![TypeScript](https://img.shields.io/badge/TypeScript-strict-7c6dfa?style=flat-square)
![Tests](https://img.shields.io/badge/tests-passing-00e5a0?style=flat-square)
![Coverage](https://img.shields.io/badge/coverage-≥80%25-00e5a0?style=flat-square)
![Node](https://img.shields.io/badge/node-20+-f0a500?style=flat-square)

---

## What It Does

Users authenticate, upload PDF documents, and ask natural-language questions about them. The API:

1. **Parses and chunks** the PDF on upload using `pdf-parse`
2. **Embeds each chunk** using Google Gemini's `text-embedding-004` model
3. **Stores embeddings** in an in-memory vector store (LangChain `MemoryVectorStore`)
4. **On each query**, retrieves the top-5 most relevant chunks, sends them as context to `gemini-2.5-flash`, and **streams the response** token-by-token via SSE
5. **Logs every query** to MongoDB with user ID, tokens used, latency, and chunk count
6. **Rate limits** each user to 10 queries/minute via a Redis sliding window

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20, TypeScript (strict) |
| Framework | Express.js |
| AI / LLM | Google Gemini API (`gemini-2.5-flash`) |
| Embeddings | Google Gemini (`text-embedding-004`) |
| RAG Framework | LangChain (`@langchain/google-genai`, `langchain`) |
| Primary Database | PostgreSQL — users, documents, refresh tokens |
| Audit Database | MongoDB — query logs |
| Cache / Rate Limit | Redis — sliding window per user |
| File Storage | Local filesystem (configurable via `UPLOAD_DIR`) |
| Validation | Zod |
| Testing | Jest + Supertest |
| Auth | JWT (access + refresh token pattern) |

---

## Architecture

```
Client Request
      │
      ▼
  Express App
      │
  ┌───┴──────────────────────────────────┐
  │  Middleware Stack (in order)         │
  │  1. helmet()       — security headers│
  │  2. cors()         — origin control  │
  │  3. morgan()       — request logging │
  │  4. authenticate() — JWT verify      │
  │  5. rateLimitMiddleware() — Redis    │
  │  6. validate()     — Zod schema      │
  └───┬──────────────────────────────────┘
      │
  ┌───▼───────────────────┐
  │     Controllers        │
  │  auth / document /     │
  │  query / admin         │
  └───┬───────────────────┘
      │
  ┌───▼───────────────────────────────────┐
  │            Services                    │
  │                                        │
  │  rag.service.ts                        │
  │  ┌─────────────────────────────────┐   │
  │  │ PDF text → chunk → embed        │   │
  │  │ Query → retrieve top-k chunks   │   │
  │  │ Chunks + prompt → Gemini stream │   │
  │  └─────────────────────────────────┘   │
  │                                        │
  │  postgres.ts   mongo.ts   redis.ts     │
  └───┬───────────────────────────────────┘
      │
  ┌───▼──────────────────────────────────┐
  │  PostgreSQL   MongoDB   Redis        │
  │  (users/docs) (logs)   (rate limit)  │
  └──────────────────────────────────────┘
```

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ✗ | Register new user, returns JWT pair |
| `POST` | `/api/auth/login` | ✗ | Login, returns JWT pair |
| `POST` | `/api/auth/refresh` | ✗ | Refresh access token via refresh token |
| `POST` | `/api/auth/logout` | ✓ | Invalidate refresh token |

**Register / Login request body:**

```json
{ "email": "user@example.com", "password": "minlength8" }
```

**Register / Login response:**

```json
{
  "user": { "id": "uuid", "email": "user@example.com", "role": "user" },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

---

### Documents

All routes require `Authorization: Bearer <accessToken>`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/documents/upload` | Upload PDF (`multipart/form-data`, field: `file`) |
| `GET` | `/api/documents` | List all documents for the current user |
| `GET` | `/api/documents/:id` | Get a single document by ID |
| `DELETE` | `/api/documents/:id` | Delete document and remove from vector store |

**Upload response:**

```json
{
  "id": "uuid",
  "filename": "report.pdf",
  "size_bytes": 204800,
  "page_count": 12,
  "created_at": "2025-04-14T10:00:00Z",
  "status": "indexing"
}
```

> `status: "indexing"` means the RAG pipeline is running asynchronously. Wait 3–10 seconds before querying, depending on PDF size.

---

### Query

Requires `Authorization: Bearer <accessToken>`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/query` | Ask a question — streams SSE response |
| `GET` | `/api/query/history` | Get current user's query history |

**Query request body:**

```json
{
  "document_id": "valid-uuid",
  "prompt": "What are the key findings in section 3?"
}
```

**Query response** — Server-Sent Events stream (`Content-Type: text/event-stream`):

```
data: {"token":"The"}
data: {"token":" key"}
data: {"token":" findings"}
...
data: {"done":true}
```

**On rate limit (429):**

```json
{
  "message": "Rate limit exceeded. Please slow down.",
  "retryAfter": 60
}
```

**Rate limit headers on every query response:**

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1713096060
Retry-After: 60   (only on 429)
```

**History response:**

```json
{
  "logs": [
    {
      "_id": "mongo-object-id",
      "user_id": "uuid",
      "document_id": "uuid",
      "prompt": "What is this about?",
      "response_preview": "This document covers...",
      "tokens_used": 312,
      "latency_ms": 1840,
      "chunks_retrieved": 5,
      "rate_limited": false,
      "created_at": "2025-04-14T10:05:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 45, "pages": 3 }
}
```

---

### Admin

Requires `Authorization: Bearer <accessToken>` and `role: "admin"`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/stats` | Aggregate usage stats |
| `GET` | `/api/admin/logs` | All query logs (paginated) |

**Stats response:**

```json
{
  "totalQueries": 1284,
  "totalUsers": 38,
  "totalDocuments": 92,
  "avgLatencyMs": 1620,
  "totalTokensUsed": 482900,
  "queriesPerDay": [
    { "_id": "2025-04-13", "count": 47 },
    { "_id": "2025-04-14", "count": 63 }
  ]
}
```

---

## Data Models

### PostgreSQL

**`users`**

```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
email       VARCHAR(255) UNIQUE NOT NULL
password    VARCHAR(255) NOT NULL        -- bcrypt, 12 rounds
role        VARCHAR(20) DEFAULT 'user'   -- 'user' | 'admin'
created_at  TIMESTAMP DEFAULT NOW()
```

**`documents`**

```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id     UUID REFERENCES users(id) ON DELETE CASCADE
filename    VARCHAR(255) NOT NULL
filepath    VARCHAR(500) NOT NULL
size_bytes  INTEGER DEFAULT 0
page_count  INTEGER DEFAULT 0
created_at  TIMESTAMP DEFAULT NOW()
```

**`refresh_tokens`**

```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id     UUID REFERENCES users(id) ON DELETE CASCADE
token       TEXT UNIQUE NOT NULL
expires_at  TIMESTAMP NOT NULL
created_at  TIMESTAMP DEFAULT NOW()
```

### MongoDB (`query_logs` collection)

```json
{
  "_id": "ObjectId",
  "user_id": "string",
  "document_id": "string",
  "prompt": "string",
  "prompt_hash": "string (sha256, first 16 chars)",
  "response_preview": "string (first 200 chars of answer)",
  "tokens_used": "number",
  "latency_ms": "number",
  "chunks_retrieved": "number",
  "rate_limited": "boolean",
  "created_at": "Date"
}
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- MongoDB Atlas account (free tier)
- Redis instance
- Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))

### 1. Clone and install

```bash
git clone https://github.com/tasnim-rizvy/smartdoc-review.git
cd smartdoc-review
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

```env
# AI
GEMINI_API_KEY=AIza...

# Databases
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/smartdoc
DATABASE_URL=postgresql://user:pass@host:5432/smartdoc
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# App
PORT=4000
NODE_ENV=development
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
```

### 3. Run

```bash
npm run dev       # development (ts-node-dev, hot reload)
npm run build     # compile TypeScript
npm start         # run compiled JS
```

### 4. Test

```bash
npm test                    # run all tests
npm test -- --coverage      # with coverage report
```

---

## Project Structure

```
src/
├── index.ts                  # Bootstrap: connect DBs, start server
├── app.ts                    # Express app, middleware, route mounting
│
├── types/
│   └── index.ts              # Shared TypeScript interfaces
│
├── db/
│   ├── postgres.ts           # Pool, connection, auto-migrations
│   ├── mongo.ts              # Mongoose connect/disconnect
│   └── redis.ts              # ioredis client with fallback
│
├── services/
│   ├── rag.service.ts        # LangChain RAG: index, query, stream
│   ├── auth.service.ts
│   ├── documents.service.ts
│   └── admin.service.ts
│
├── middlewares/
│   ├── auth.middleware.ts    # JWT verify, requireAdmin
│   ├── rate-limit.middleware.ts # Redis sliding window
│   ├── validate.middleware.ts  # Zod schema validation
│   ├── upload.middleware.ts    # Multer (PDF only, 10 MB limit)
│   └── error.middleware.ts     # Global error handler
│
├── models/
│   └── QueryLog.ts           # Mongoose schema for audit logs
│
├── controllers/
│   ├── auth.controller.ts
│   ├── documents.controller.ts
│   ├── query.controller.ts
│   └── admin.controller.ts
│
├── routes/
│   ├── auth.routes.ts
│   ├── document.routes.ts
│   ├── query.routes.ts
│   ├── admin.routes.ts
│   └── index.ts
│
└── __tests__/
    ├── setup.ts
    ├── auth.middleware.test.ts
    ├── validate.middleware.test.ts
    └── rateLimit.middleware.test.ts
```

---

## Error Response Format

All errors follow a consistent shape:

```json
{
  "message": "Human-readable description",
  "code": "OPTIONAL_ERROR_CODE"
}
```

| Status | Meaning |
|---|---|
| `400` | Validation failure — check `errors` field for details |
| `401` | Missing or invalid JWT |
| `403` | Valid JWT but insufficient role |
| `404` | Resource not found |
| `409` | Conflict (e.g. email already registered) |
| `429` | Rate limit exceeded — check `Retry-After` header |
| `500` | Internal server error — internals never exposed |

---

## Key Design Decisions

**Why two databases?**
PostgreSQL handles relational data with strict schemas (users, documents). MongoDB handles the audit log because each query log entry has variable shape and append-only access patterns suit a document store.

**Why in-memory vector store?**
`MemoryVectorStore` from LangChain requires zero infrastructure and is sufficient for single-user demo scenarios. The `rag.service.ts` is designed so swapping in Pinecone or pgvector requires changing only the store initialisation — the rest of the pipeline is unchanged.

**Why SSE over WebSockets?**
Server-Sent Events are unidirectional, stateless, and work over standard HTTP. No socket handshake, no upgrade headers, no proxy configuration. For one-way streaming (server → client), SSE is simpler and more reliable.

**Why Redis sliding window over fixed window?**
A fixed window allows burst abuse at window boundaries (e.g. 10 requests at 0:59 + 10 at 1:00 = 20 in 2 seconds). A sliding window tracks actual request timestamps and distributes limits evenly across time.

---

## Deployment

### Railway (recommended)

1. Connect GitHub repo to Railway
2. Add PostgreSQL and Redis plugins
3. Set all environment variables
4. Deploy — Railway auto-detects Node.js

### Docker

```bash
docker build -t smartdoc-api .
docker run -p 4000:4000 --env-file .env smartdoc-api
```

---

## Running as an Admin

Promote a user to admin directly via SQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

Then use their JWT to access `/api/admin/*` routes.

---

## Author

Built by **Tasnim Rizvy** — demonstrating full-stack TypeScript, LLM integration with LangChain + Gemini, RAG pipeline design, and production API patterns including audit logging, rate limiting, and streaming responses.
