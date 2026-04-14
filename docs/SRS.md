# Software Requirements Specification
## SmartDoc Review

**Version:** 1.0.0
**Date:** 2025-04-14  
**Author:** Tasnim Rizvy

---

## 1. Problem Statement

Teams waste hours manually reading long documents to find specific information. SmartDoc Review lets users upload any PDF and ask natural-language questions about it, receiving AI-generated answers grounded in the document content — with full audit logging and per-user rate limiting.

---

## 2. Scope

| In Scope | Out of Scope |
|---|---|
| PDF upload and parsing | Word / Excel file support |
| RAG-based Q&A (LangChain + OpenAI) | Multi-document cross-querying |
| JWT authentication | OAuth / SSO |
| MongoDB audit logging | Real-time collaboration |
| Per-user rate limiting | Billing / subscriptions |
| Streaming AI responses | Mobile native app |
| Admin query log dashboard | User management UI |

---

## 3. User Stories

| ID | As a... | I want to... | So that... |
|---|---|---|---|
| US-01 | User | Register and log in | I can access my documents securely |
| US-02 | User | Upload a PDF | The system can answer questions about it |
| US-03 | User | Ask questions about my document | I can find information without reading the whole doc |
| US-04 | User | See streamed AI responses | I get answers fast without waiting |
| US-05 | User | View my query history | I can reference past answers |
| US-06 | Admin | View all query logs | I can monitor usage and debug issues |
| US-07 | System | Enforce rate limits | OpenAI costs stay controlled |

---

## 4. API Routes

### Auth
| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Create new user | No |
| POST | `/api/auth/login` | Login, returns JWT | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| POST | `/api/auth/logout` | Invalidate refresh token | Yes |

### Documents
| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/documents/upload` | Upload PDF | Yes |
| GET | `/api/documents` | List user's documents | Yes |
| GET | `/api/documents/:id` | Get document metadata | Yes |
| DELETE | `/api/documents/:id` | Delete document | Yes |

### Query
| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/query` | Ask question, stream response | Yes |
| GET | `/api/query/history` | Get user's query history | Yes |

### Admin
| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/api/admin/logs` | All query audit logs | Yes (admin) |
| GET | `/api/admin/stats` | Usage stats | Yes (admin) |

---

## 5. Data Models

### PostgreSQL

**users**
```
id          UUID PRIMARY KEY
email       VARCHAR(255) UNIQUE NOT NULL
password    VARCHAR(255) NOT NULL  -- bcrypt hashed
role        VARCHAR(20) DEFAULT 'user'
created_at  TIMESTAMP DEFAULT NOW()
```

**documents**
```
id          UUID PRIMARY KEY
user_id     UUID REFERENCES users(id)
filename    VARCHAR(255)
filepath    VARCHAR(500)
size_bytes  INTEGER
page_count  INTEGER
created_at  TIMESTAMP DEFAULT NOW()
```

**refresh_tokens**
```
id          UUID PRIMARY KEY
user_id     UUID REFERENCES users(id)
token       TEXT UNIQUE
expires_at  TIMESTAMP
created_at  TIMESTAMP DEFAULT NOW()
```

### MongoDB

**query_logs**
```json
{
  "_id": "ObjectId",
  "user_id": "string",
  "document_id": "string",
  "prompt": "string",
  "prompt_hash": "string",
  "response_preview": "string (first 200 chars)",
  "tokens_used": "number",
  "latency_ms": "number",
  "chunks_retrieved": "number",
  "rate_limited": "boolean",
  "created_at": "Date"
}
```

---

## 6. Non-Functional Requirements

| Requirement | Target |
|---|---|
| First token latency | < 2 seconds |
| Rate limit | 10 queries / user / minute |
| File size limit | 10 MB per PDF |
| Test coverage | ≥ 80% on API modules |
| Auth token expiry | Access: 15m, Refresh: 7d |

---

## 7. Milestones

| Milestone | Deliverable | UAC |
|---|---|---|
| M1 | Auth + Document Upload API | Register, login, upload PDF, verify in DB |
| M2 | RAG Pipeline + Streaming | Ask question, get streamed answer from doc |
| M3 | Rate Limiting + Validation | 429 on limit exceeded, input rejected cleanly |
| M4 | Frontend + Deploy | Live URL, Loom demo, README complete |
