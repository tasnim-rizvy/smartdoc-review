import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'fs';

import { authRoutes, adminRoutes, documentRoutes, queryRoutes } from './router';

const app = express();

const uploadDir = process.env.UPLOAD_DIR || './uploads'
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

// ─── Middleware ───────────────────────────────────────────
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))

// ─── Routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/query', queryRoutes)
app.use('/api/admin', adminRoutes)

app.get('/api/health', (_req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() })
});

export default app