import express from 'express';

import authRoutes from './router/auth.routes';

const app = express();

app.use('/api/auth', authRoutes)

app.get('/api/health', (_req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() })
});

export default app