import { Multer } from 'multer';
import { Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { AuthRequest } from '../types';
import { getPool } from '../services/postgres';

interface UploadRequest extends AuthRequest {
	file?: Express.Multer.File;
}

export async function upload(
	req: UploadRequest,
	res: Response,
	next: NextFunction,
) {
	try {
		if (!req.file) {
			return res.status(400).json({ error: 'No file uploaded' });
		}

		const userId = req.user?.id;
		const { filename, path: filepath, size } = req.file;

		const buffer = fs.readFileSync(filepath);
		const parsed = await pdfParse(buffer);
		const pageCount = parsed.numpages;

		const db = getPool();
		const result = await db.query(
			`INSERT INTO documents (user_id, filename, filepath, size_bytes, page_count)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
			[userId, req.file.originalname, filepath, size, pageCount],
		);
		const doc = result.rows[0];

		res.status(201).json({
			id: doc.id,
			filename: doc.filename,
			size_bytes: doc.size_bytes,
			page_count: doc.page_count,
			created_at: doc.created_at,
			status: 'indexing',
		});
	} catch (error) {
		next(error);
	}
}

export async function list(
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) {
	try {
		const db = getPool();
		const result = await db.query(
			`SELECT * FROM documents WHERE user_id = $1`,
			[req.user?.id]
		);
		res.json(result.rows);
	} catch (error) {
		next(error);
	}
}

export async function get(req: AuthRequest, res: Response, next: NextFunction) {
	try {
		const db = getPool();
		const result = await db.query(
			`SELECT * FROM documents WHERE id = $1 AND user_id = $2`,
			[req.params.id, req.user?.id]
		);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: 'Document not found' });
		}
		res.json(result.rows[0]);
	} catch (error) {
		next(error);
	}
}

export async function remove(
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) {
	try {
		const db = getPool();
		const result = await db.query(
			`DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING *`,
			[req.params.id, req.user?.id]
		);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: 'Document not found' });
		}
		res.json({ message: 'Document deleted successfully' });
	} catch (error) {
		next(error);
	}
}
