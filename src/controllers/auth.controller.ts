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
		expiresIn: (process.env.JWT_EXPIRES_IN ??
			'15m') as jwt.SignOptions['expiresIn'],
	});
}

function generateRefresh(user: { id: number }) {
	return jwt.sign({ sub: user.id }, process.env.JWT_REFRESH_SECRET!, {
		expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ??
			'7d') as jwt.SignOptions['expiresIn'],
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
			accessToken,
			refreshToken,
		});
	} catch (error) {
		next(error);
	}
}

export async function login(req: Request, res: Response, next: NextFunction) {
	try {
		const { email, password } = req.body;
		const db = getPool();

		const result = await db.query(
			'SELECT id, email, password, role FROM users WHERE email = $1',
			[email],
		);
		if (result.rows.length === 0) {
			return next(createError('Invalid credentials', 401));
		}

		const user = result.rows[0];
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return next(createError('Invalid credentials', 401));
		}

		const accessToken = generateAccess(user);
		const refreshToken = generateRefresh(user);

		res.json({
			user: {
				id: user.id,
				email: user.email,
				role: user.role,
			},
			accessToken,
			refreshToken,
		});
	} catch (error) {
		next(error);
	}
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
	try {
		const { refreshToken } = req.body;
        if (!refreshToken) {
            return next(createError('Refresh token required', 400));
        }

        const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as jwt.JwtPayload;
        const db = getPool();
        const result = await db.query('SELECT id, email, role FROM users WHERE id = $1', [payload.sub]);
        if (result.rows.length === 0) {
            return next(createError('User not found', 404));
        }

        const user = result.rows[0];
        const accessToken = generateAccess(user);
        const newRefreshToken = generateRefresh(user);

        res.json({ accessToken, refreshToken: newRefreshToken });
	} catch (error) {
		next(error);
	}
}

export async function logout(req: Request, res: Response, next: NextFunction) {}
