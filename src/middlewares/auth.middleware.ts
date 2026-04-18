import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';

export function authenticate(
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) {
	const authHeader = req.headers['authorization'];
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ message: 'Authentication required' });
	}

	const token = authHeader.split(' ')[1];
	if (!token) {
		return res.status(401).json({ message: 'No token provided' });
	}

	try {
		const payload = jwt.verify(
			token,
			process.env.JWT_SECRET!,
		) as jwt.JwtPayload;
		req.user = {
			id: payload.sub,
			email: payload.email,
			role: payload.role,
		};
		next();
	} catch (err) {
		return res.status(401).json({ message: 'Invalid token' });
	}
}

export function requireAdmin(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    if (!req.user) {
        return res.status(401).json({ message: 'Access Denied' });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
}
