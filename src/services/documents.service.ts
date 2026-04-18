import { getPool } from '../db/postgres';

export interface DocumentRow {
	id: string;
	user_id: string;
	filename: string;
	filepath: string;
	size_bytes: number;
	page_count: number;
	created_at: Date;
}

export async function createDocument(
	userId: string | number,
	filename: string,
	filepath: string,
	sizeBytes: number,
	pageCount: number,
) {
	const db = getPool();
	const result = await db.query<DocumentRow>(
		`INSERT INTO documents (user_id, filename, filepath, size_bytes, page_count)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
		[userId, filename, filepath, sizeBytes, pageCount],
	);
	return result.rows[0];
}

export async function findDocuments(
	id?: string | number,
	userId?: string | number,
) {
	const db = getPool();
	const conditions: string[] = [];
	const values: (string | number)[] = [];
	let paramIndex = 1;

	if (id !== undefined) {
		conditions.push(`id = $${paramIndex}`);
		values.push(id);
		paramIndex++;
	}
	if (userId !== undefined) {
		conditions.push(`user_id = $${paramIndex}`);
		values.push(userId);
	}

	if (conditions.length === 0) {
		return [];
	}

	const result = await db.query<DocumentRow>(
		`SELECT * FROM documents WHERE ${conditions.join(' AND ')}`,
		values,
	);
	return result.rows;
}

export async function deleteDocument(
	id: string | number,
	userId: string | number,
) {
	const db = getPool();
	const result = await db.query<DocumentRow>(
		`DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING *`,
		[id, userId],
	);
	return result.rows[0] ?? null;
}
