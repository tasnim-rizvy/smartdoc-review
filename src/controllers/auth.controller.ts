import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import {
	findUserByEmail,
	findUserByEmailStrict,
	createUser,
	findUserById,
	findRefreshToken,
	deleteRefreshToken,
	generateAccess,
	generateRefresh,
	hashPassword,
	comparePassword,
} from '../services/auth.service';
import { createError } from '../middlewares/error.middleware';

export async function register(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const { email, password } = req.body;

		const existing = await findUserByEmailStrict(email);
		if (existing) {
			return next(createError('Email already registered', 409));
		}

		const hashed = await hashPassword(password);
		const user = await createUser(email, hashed);

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

		const user = await findUserByEmail(email);
		if (!user) {
			return next(createError('Invalid credentials', 401));
		}

		const isMatch = await comparePassword(password, user.password);
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

		const stored = await findRefreshToken(refreshToken);
		if (!stored) {
			return next(createError('Invalid refresh token', 401));
		}

		const payload = jwt.verify(
			refreshToken,
			process.env.JWT_REFRESH_SECRET!,
		) as jwt.JwtPayload;
		const user = await findUserById(Number(payload.sub));
		if (!user) {
			return next(createError('User not found', 404));
		}

		const accessToken = generateAccess(user);
		const newRefreshToken = generateRefresh(user);

		res.json({ accessToken, refreshToken: newRefreshToken });
	} catch (error) {
		next(error);
	}
}

export async function logout(req: Request, res: Response, next: NextFunction) {
	try {
		const { refreshToken } = req.body;
		if (!refreshToken) {
			return next(createError('Refresh token required', 400));
		}

		await deleteRefreshToken(refreshToken);
		res.json({ message: 'Logged out successfully' });
	} catch (error) {
		next(error);
	}
}
