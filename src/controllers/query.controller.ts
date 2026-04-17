import { Response, NextFunction } from 'express';
import crypto from 'crypto';
import { AuthRequest } from '../types';
import { getPool } from '../db/postgres';
import { QueryLog } from '../models/QueryLog';
import { createError } from '../middlewares/error.middleware';
import { queryDocuments } from '../services/rag.service';

export async function handleQuery(
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) {
	const startTime = Date.now();
	const { document_id, query } = req.body;
	const userId = req.user!.id;

	const db = getPool();
	const docResult = await db.query(
		'SELECT * FROM documents WHERE id = $1 AND user_id = $2',
		[document_id, userId],
	);

	if (docResult.rows.length === 0) {
		return next(createError('Document not found', 404));
	}

	// Setup SSE Streaming
	res.setHeader('Content-Type', 'text/event-stream');
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Connection', 'keep-alive');
	res.setHeader('X-Accel-Buffering', 'no');
	res.flushHeaders();

	let fullResponse = '';
	let tokenUsed = 0;

	try {
		const { stream, chunksRetrieved } = await queryDocuments(
			document_id,
			query,
		);

		for await (const chunk of stream) {
			fullResponse += chunk;
			tokenUsed += chunk.split(' ').length;

			res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`);
		}

		res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
		res.end();

		const latencyMs = Date.now() - startTime;
		const promptHash = crypto
			.createHash('sha256')
			.update(query)
			.digest('hex')
			.slice(0, 16);

		QueryLog.create({
			user_id: userId,
			document_id,
			prompt: query,
			prompt_hash: promptHash,
			response_preview: fullResponse.slice(0, 200),
			tokens_used: tokenUsed,
			latency_ms: latencyMs,
			chunks_retrieved: chunksRetrieved,
			rate_limited: false,
		}).catch((err) => console.error('Failed to save query log:', err));
	} catch (err: any) {
		const errorMsg = err.message || 'Failed to process query';
		res.write(`data: ${JSON.stringify({ error: errorMsg })}\n\n`);
		res.end();

		QueryLog.create({
			user_id: userId,
			document_id,
			prompt: query,
			prompt_hash: crypto
				.createHash('sha256')
				.update(query)
				.digest('hex')
				.slice(0, 16),
			response_preview: `ERROR: ${errorMsg}`,
			tokens_used: 0,
			latency_ms: Date.now() - startTime,
			chunks_retrieved: 0,
			rate_limited: false,
		}).catch(console.error);
	}
}

export async function getHistory(
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) {
	try {
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 20;
		const skip = (page - 1) * limit;

		const [logs, total] = await Promise.all([
			QueryLog.find({ user_id: req.user!.id })
				.sort({ created_at: -1 })
				.skip(skip)
				.limit(limit)
				.select('-prompt_hash'),
			QueryLog.countDocuments({ user_id: req.user!.id }),
		]);

		res.json({
			logs,
			pagination: { page, limit, total, pages: Math.ceil(total / limit) },
		});
	} catch (err) {
		next(err);
	}
}
