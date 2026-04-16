import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { getPool } from '../services/postgres';
import { createError } from '../middlewares/error.middleware';

function generateAccess(user: { id: number; email: string; role: string }) {
	const payload = {
		sub: user.id,
		email: user.email,
		role: user.role,
	};
	return jwt.sign(payload, process.env.JWT_SECRET!, {
		expiresIn: process.env.JWT_EXPIRES_IN || '15m',
	});
}

function generateRefresh(user: { id: number; email: string; role: string }) {
	return jwt.sign({ sub: user.id }, process.env.JWT_REFRESH_SECRET!, {
		expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
	});
}

export async function register(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const { email, password } = req.body;
		const db = getPool();

		const existing = await db.query('SELECT id FROM users WHERE email = $1', [
			email,
		]);
		if (existing.rows.length > 0) {
			return next(createError('Email already registered', 409));
		}

		const hashed = await bcrypt.hash(password, 12);
		const result = await db.query(
			'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, role, created_at',
			[email, hashed],
		);
		const user = result.rows[0];

        const accessToken = generateAccess(user);
        const refreshToken = generateRefresh(user);

		res.status(201).json({
			user: {
				id: user.id,
				email: user.email,
				role: user.role,
				createdAt: user.created_at,
			},
		});
	} catch (error) {
		next(error);
	}
}

export async function login(req: Request, res: Response, next: NextFunction) {}

export async function refresh(
	req: Request,
	res: Response,
	next: NextFunction,
) {}

export async function logout(req: Request, res: Response, next: NextFunction) {}
