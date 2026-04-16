import { Request, Response, NextFunction } from 'express';
import { getPool } from '../services/postgres';
import { createError } from '../middlewares/error.middleware';

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
