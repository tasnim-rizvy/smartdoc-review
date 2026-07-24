import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { AuthRequest } from '../types';

const mockRes = () => {
	const res = {} as Response;
	res.status = jest.fn().mockReturnValue(res);
	res.json = jest.fn().mockReturnValue(res);
	return res;
};

describe('authenticate middleware', () => {
	const next: NextFunction = jest.fn();

	beforeEach(() => jest.clearAllMocks());

	it('returns 401 if no Authorization header', () => {
		const req = { headers: {} } as Request;
		const res = mockRes();
		authenticate(req as AuthRequest, res, next);
		expect(res.status).toHaveBeenCalledWith(401);
		expect(next).not.toHaveBeenCalled();
	});

	it('returns 401 if header is not Bearer format', () => {
		const req = { headers: { authorization: 'Basic abc123' } } as Request;
		const res = mockRes();
		authenticate(req as AuthRequest, res, next);
		expect(res.status).toHaveBeenCalledWith(401);
	});

	it('returns 401 for invalid token', () => {
		const req = {
			headers: { authorization: 'Bearer invalid.token.here' },
		} as Request;
		const res = mockRes();
		authenticate(req as AuthRequest, res, next);
		expect(res.status).toHaveBeenCalledWith(401);
	});

	it('calls next and sets req.user for valid token', () => {
		const token = jwt.sign(
			{ id: 'user-123', email: 'test@test.com', role: 'user' },
			process.env.JWT_SECRET!,
		);
		const req = { headers: { authorization: `Bearer ${token}` } } as Request;
		const res = mockRes();
		authenticate(req as AuthRequest, res, next);
		expect(next).toHaveBeenCalled();
		expect((req as AuthRequest).user).toEqual({
			id: 'user-123',
			email: 'test@test.com',
			role: 'user',
		});
	});
});

describe('requireAdmin middleware', () => {
	const next: NextFunction = jest.fn();
	beforeEach(() => jest.clearAllMocks());

	it('returns 403 if user is not admin', () => {
		const req = {
			user: { id: '1', email: 'u@u.com', role: 'user' },
		} as AuthRequest;
		const res = mockRes();
		requireAdmin(req, res, next);
		expect(res.status).toHaveBeenCalledWith(403);
	});

	it('calls next if user is admin', () => {
		const req = {
			user: { id: '1', email: 'a@a.com', role: 'admin' },
		} as AuthRequest;
		const res = mockRes();
		requireAdmin(req, res, next);
		expect(next).toHaveBeenCalled();
	});
});
