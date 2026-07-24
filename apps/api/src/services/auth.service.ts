import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { getPool } from '../db/postgres';

export async function findUser(parameter: 'email' | 'id', value: string | number) {
	const db = getPool();
	const column = parameter === 'id' ? 'id' : 'email';
	const result = await db.query(
		`SELECT id, email, password, role, created_at FROM users WHERE ${column} = $1`,
		[value],
	);
	return result.rows[0] ?? null;
}

export async function createUser(email: string, hashedPassword: string) {
	const db = getPool();
	const result = await db.query(
		'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, role, created_at',
		[email, hashedPassword],
	);
	return result.rows[0];
}

export async function findRefreshToken(token: string) {
	const db = getPool();
	const result = await db.query(
		'SELECT id FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
		[token],
	);
	return result.rows[0] ?? null;
}

export async function deleteRefreshToken(token: string) {
	const db = getPool();
	await db.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
}

export async function saveRefreshToken(userId: string, token: string) {
	const db = getPool();
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
	await db.query(
		'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
		[userId, token, expiresAt],
	);
}

export function generateAccess(user: { id: string; email: string; role: string }) {
	const payload = {
		sub: user.id,
		email: user.email,
		role: user.role,
	};
	return jwt.sign(payload, process.env.JWT_SECRET!, {
		expiresIn: (process.env.JWT_EXPIRES_IN ?? '15m') as jwt.SignOptions['expiresIn'],
	});
}

export function generateRefresh(user: { id: string }) {
	return jwt.sign({ sub: user.id }, process.env.JWT_REFRESH_SECRET!, {
		expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn'],
	});
}

export async function hashPassword(password: string) {
	return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hashedPassword: string) {
	return bcrypt.compare(password, hashedPassword);
}
