## Instructions for AI Agents Working on SmartDoc Review

This file defines how AI coding agents should behave when working on this codebase. Read this entire file before making any changes.

---

## Project Summary

SmartDoc Review is a full-stack TypeScript monorepo. Users upload PDFs and ask natural-language questions about them. The backend uses a RAG pipeline (LangChain + Gemini) to retrieve relevant chunks and stream answers. Every query is audit-logged to MongoDB. Rate limiting is enforced per user via Redis.

```
apps/api/   → Express.js + TypeScript backend
apps/web/   → Next.js 14 frontend
docs/       → SRS, architecture, demo links
```

---

## Non-Negotiable Rules

1. **Never modify `docs/SRS.md` unless explicitly asked.** It is the source of truth. If code conflicts with the SRS, fix the code — not the spec.

2. **Never commit secrets.** Do not hardcode API keys, connection strings, or JWT secrets. All secrets go in `.env`. Reference them via `process.env.VAR_NAME`.

3. **Never skip TypeScript types.** Do not use `any` unless there is no other option. If you use `any`, add a comment explaining why.

4. **Never delete or weaken existing tests.** If a refactor breaks a test, fix the implementation — not the test — unless the test itself is provably wrong.

5. **Never install a new dependency without a comment in the PR explaining why.** Prefer packages already in `package.json`.

---

## Architecture Rules

### Backend (`apps/api/`)

**Layer order — always respect this:**
```
Types → Services → Middleware → Models → Controllers → Routes → App
```
Do not import a higher layer into a lower one. For example, a service must not import from a controller.

**Database responsibilities — do not mix these:**
- `PostgreSQL` → users, documents, refresh_tokens (relational, structured)
- `MongoDB` → query_logs only (audit trail, schema-flexible)
- `Redis` → rate limiting only (ephemeral, sliding window)

**Controllers must:**
- Never contain business logic. Business logic belongs in services.
- Always call `next(err)` on errors — never `res.status(500).json(...)` directly.
- Always validate input through the `validate()` middleware before the controller runs.

**Services must:**
- Be pure and testable in isolation.
- Not import from `controllers/` or `routes/`.
- Handle their own errors and rethrow as typed `AppError` when needed.

**Middleware must:**
- Always call `next()` or `next(err)` — never leave a request hanging.
- Be stateless where possible.
- The `rateLimitMiddleware` must always fall back to in-memory when Redis is unavailable. Do not remove this fallback.

### Frontend (`apps/web/`)

- All API calls go through `src/lib/api.ts`. Do not call `fetch()` directly in page components.
- Auth state is managed exclusively in `src/lib/auth.tsx`. Do not duplicate auth logic in components.
- Do not add client-side state management libraries (Redux, Zustand, etc.) — React state + context is sufficient for this project.
- All pages under `dashboard/` are protected. The layout (`dashboard/layout.tsx`) handles the auth redirect — do not add redundant auth checks inside individual pages.
- Streaming responses use the native `ReadableStream` API via SSE. Do not replace this with a library like `react-query` or `swr` for the chat endpoint.

---

## Code Style

### TypeScript
- Strict mode is on. All function parameters and return types must be explicitly typed.
- Use `interface` for object shapes, `type` for unions and primitives.
- Prefer `async/await` over `.then()` chains.
- Always handle the error case. No empty `catch {}` blocks — at minimum, log the error.

### Naming
- Files: `kebab-case` for all files (e.g. `auth.middleware.ts`)
- Variables/functions: `camelCase`
- Types/Interfaces: `PascalCase`
- Constants: `SCREAMING_SNAKE_CASE`
- React components: `PascalCase`

### Imports
- Sort imports: external packages first, then internal (`@/...`), then relative.
- Do not use barrel files (`index.ts` re-exports) unless they already exist.

### Error handling
- Use `createError(message, status, code)` from `error.middleware.ts` to create typed errors.
- HTTP status codes must be semantically correct:
  - `400` — bad input (validation failure)
  - `401` — not authenticated
  - `403` — authenticated but not authorized
  - `404` — resource not found
  - `409` — conflict (e.g. duplicate email)
  - `429` — rate limited
  - `500` — unexpected server error (never expose internals)

---

## Testing Rules

- Tests live in `apps/api/src/__tests__/`.
- Test file naming: `[subject].test.ts` (e.g. `auth.middleware.test.ts`).
- Coverage threshold is **80% lines and functions, 70% branches**. Do not lower these values in `jest.config.js`.
- Every new middleware file must have a corresponding test file.
- Every new controller must have integration tests via Supertest.
- Mock external services in tests (MongoDB, PostgreSQL, Redis, Gemini API). Tests must not make real network calls.
- Use `jest.mock()` at the module level, not inside individual tests.
- Test setup goes in `src/__tests__/setup.ts`. Add new environment variables there if your feature needs them.

**Test structure to follow:**
```ts
describe('ModuleName', () => {
  describe('functionName', () => {
    it('does X when Y', () => { ... })
    it('returns 400 when Z is missing', () => { ... })
    it('calls next(err) on database failure', () => { ... })
  })
})
```

---

## RAG Pipeline Rules

The RAG pipeline in `src/services/rag.service.ts` is the most critical service. Follow these rules when modifying it:

- **Do not change the chunking strategy** (1000 chars, 200 overlap) without testing retrieval quality on at least 3 different PDFs.
- **Do not change `k: 5`** (top-k retrieval) without benchmarking. Increasing it raises cost and latency; decreasing it reduces answer quality.
- **Indexing is async and non-blocking.** The upload endpoint returns immediately with `status: "indexing"`. Do not make it synchronous — large PDFs can take 10+ seconds to index.
- The in-memory vector store (`MemoryVectorStore`) resets on server restart. This is intentional for the portfolio version. Do not replace it with a persistent vector store unless the task explicitly says to.
- The system prompt instructs the model to only answer from document context. Do not soften or remove this constraint — it is a core feature, not a suggestion.

---

## Git Rules

### Branch naming
```
feat/[milestone]-[short-description]   → feat/m2-rag-pipeline
fix/[short-description]                → fix/upload-file-size-check
test/[short-description]               → test/query-controller-coverage
chore/[short-description]              → chore/update-dependencies
docs/[short-description]               → docs/update-readme-demo-links
```

### Commit messages
Follow this format exactly:
```
type(scope): short description in imperative mood

# Good:
feat(m2): add streaming RAG query endpoint
fix(auth): handle expired refresh token edge case
test(middleware): add rate limit fallback coverage
docs(srs): clarify document deletion behavior

# Bad:
updated the auth stuff
WIP
fix bug
```

Types: `feat`, `fix`, `test`, `docs`, `chore`, `refactor`, `perf`

### What not to commit
- `node_modules/`
- `.env` or any file with real credentials
- `uploads/` directory contents
- `dist/` or `.next/` build outputs
- Any file containing a real API key, even in a comment

---

## Environment Variables

All variables are documented in `.env` at the root. When adding a new environment variable:

1. Add it to `.env` with a placeholder value and a comment explaining it.
2. Add it to `src/__tests__/setup.ts` with a safe test value.
3. Document it in the `README.md` under "Getting Started".
4. Never provide a default value for secrets in code — throw a clear error at startup instead:

```ts
const secret = process.env.MY_SECRET
if (!secret) throw new Error('MY_SECRET is not defined in environment')
```

---

## Adding a New Feature — Checklist

Before opening a PR for any new feature:

- [ ] Does it conflict with the SRS? If yes, stop and ask.
- [ ] Is the feature scoped to the correct milestone branch?
- [ ] Are all new functions typed (no implicit `any`)?
- [ ] Is input validated before it reaches the controller?
- [ ] Are errors passed to `next(err)`, not returned directly?
- [ ] Is the new code covered by tests (≥80%)?
- [ ] Does `npm test` pass with no failures?
- [ ] Is the `.env.example` updated if new variables were added?
- [ ] Are commit messages following the convention above?

---

## Known Intentional Constraints

Do not "fix" these — they are deliberate decisions for the portfolio version:

| Constraint | Reason |
|---|---|
| In-memory vector store resets on restart | Avoids Pinecone/pgvector setup cost for portfolio |
| Local filesystem for PDF storage | Avoids S3 setup; Railway uses ephemeral storage in prod |
| No refresh token rotation | Scope: M1 only implements basic refresh |
| No email verification on register | Out of scope per SRS |
| Admin role set manually via SQL | No admin UI for role management per SRS |
| Single-document queries only | Multi-doc cross-querying is explicitly out of scope in SRS |

---

## Contact

If a task is ambiguous or conflicts with the SRS, stop and flag it rather than guessing. A wrong assumption in the RAG pipeline or auth layer can cascade into hard-to-debug issues.