import { Response, NextFunction } from 'express';
import fs from 'fs';
import { PDFParse } from 'pdf-parse';
import { AuthRequest } from '../types';
import {
	createDocument,
	findDocuments,
	deleteDocument,
} from '../services/documents.service';

interface UploadRequest extends AuthRequest {
	file?: Express.Multer.File;
}

export async function upload(
	req: UploadRequest,
	res: Response,
	next: NextFunction,
) {
	try {
		if (!req.file || !req.user?.id) {
			return res.status(401).json({ error: 'Unauthorized' });
		}

		const userId = req.user.id;
		const { path: filepath, size } = req.file;

		const buffer = fs.readFileSync(filepath);
		const parser = new PDFParse({ data: buffer });
		const info = await parser.getInfo();
		const pageCount = info.total;

		const doc = await createDocument(
			userId,
			req.file.originalname,
			filepath,
			size,
			pageCount,
		);

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
		if (!req.user?.id) {
			return res.status(401).json({ error: 'Unauthorized' });
		}
		const docs = await findDocuments(undefined, req.user.id);
		res.json({ documents: docs });
	} catch (error) {
		next(error);
	}
}

export async function get(req: AuthRequest, res: Response, next: NextFunction) {
	try {
		if (!req.user?.id) {
			return res.status(401).json({ error: 'Unauthorized' });
		}
		const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
		const docs = await findDocuments(id, req.user.id);
		if (docs.length === 0) {
			return res.status(404).json({ error: 'Document not found' });
		}
		res.json(docs[0]);
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
		if (!req.user?.id) {
			return res.status(401).json({ error: 'Unauthorized' });
		}
		const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
		const doc = await deleteDocument(id, req.user.id);
		if (!doc) {
			return res.status(404).json({ error: 'Document not found' });
		}
		res.json({ message: 'Document deleted successfully' });
	} catch (error) {
		next(error);
	}
}
