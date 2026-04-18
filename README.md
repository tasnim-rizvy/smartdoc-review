# SmartDoc Review API

A RESTful API for document upload, management, and AI-powered query answering with RAG (Retrieval-Augmented Generation) using Google Gemini.

## Features

- **User Authentication** - Register, login, JWT tokens with refresh token rotation
- **Document Management** - Upload PDF documents, list, delete
- **AI Query** - Ask questions about documents using Gemini + RAG
- **Rate Limiting** - Per-user rate limiting with Redis fallback to in-memory
- **Input Validation** - Zod schemas for request validation

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Railway) + MongoDB Atlas
- **Cache**: Redis (Railway)
- **AI**: Google Gemini (text-embedding-004, gemini-2.5-flash)
- **Testing**: Jest + ts-jest

## Environment Variables

Create a `.env` file:

```env
# Required - Get from Google AI Studio
GEMINI_API_KEY=your_gemini_api_key

# Database - PostgreSQL connection string
DATABASE_URL=postgresql://user:pass@host:port/db

# MongoDB - MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://...

# Redis - Railway or self-hosted
REDIS_URL=redis://...

# JWT - Generate secure secrets
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# App
PORT=4000
UPLOAD_DIR=./uploads
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
```

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| POST | `/api/documents/upload` | Upload PDF document | Yes |
| GET | `/api/documents` | List user's documents | Yes |
| GET | `/api/documents/:id` | Get document by ID | Yes |
| DELETE | `/api/documents/:id` | Delete document | Yes |
| POST | `/api/query` | Ask AI about document | Yes |
| GET | `/api/admin/users` | List all users | Admin |
| DELETE | `/api/admin/users/:id` | Delete user | Admin |
| GET | `/api/health` | Health check | No |

## Project Structure

```
src/
├── controllers/      # Route handlers
├── db/              # Database connections
├── middlewares/     # Express middleware
│   ├── auth.middleware.ts
│   ├── rate-limit.middleware.ts
│   └── validate.middleware.ts
├── models/           # Data models
├── routes/          # Route definitions
├── services/        # Business logic
│   ├── auth.service.ts
│   ├── documents.service.ts
│   └── rag.service.ts
├── types/           # TypeScript types
├── __tests__/       # Test files
├── app.ts           # Express app setup
└── index.ts         # Entry point
```

## Testing

```bash
# Run tests once
npm test

# Watch mode
npm run watch
```

## Build for Production

```bash
npm run build
npm start
```