import { Request, Response, NextFunction } from 'express';
import {
	validate,
	registerSchema,
	loginSchema,
	querySchema,
} from '../middlewares/validate.middleware';

const mockRes = () => {
	const res = {} as Response;
	res.status = jest.fn().mockReturnValue(res);
	res.json = jest.fn().mockReturnValue(res);
	return res;
};

describe('validate middleware', () => {
	const next: NextFunction = jest.fn();
	beforeEach(() => jest.clearAllMocks());

	describe('registerSchema', () => {
		const middleware = validate(registerSchema);

		it('passes valid registration data', () => {
			const req = {
				body: { email: 'user@test.com', password: 'securepass' },
			} as Request;
			middleware(req, mockRes(), next);
			expect(next).toHaveBeenCalled();
		});

		it('rejects invalid email', () => {
			const req = {
				body: { email: 'not-an-email', password: 'securepass' },
			} as Request;
			const res = mockRes();
			middleware(req, res, next);
			expect(res.status).toHaveBeenCalledWith(400);
			expect(next).not.toHaveBeenCalled();
		});

		it('rejects short password', () => {
			const req = {
				body: { email: 'u@test.com', password: 'short' },
			} as Request;
			const res = mockRes();
			middleware(req, res, next);
			expect(res.status).toHaveBeenCalledWith(400);
		});
	});

	describe('querySchema', () => {
		const middleware = validate(querySchema);

		it('passes valid query', () => {
			const req = {
				body: {
					document_id: '550e8400-e29b-41d4-a716-446655440000',
					query: 'What is this about?',
				},
			} as Request;
			middleware(req, mockRes(), next);
			expect(next).toHaveBeenCalled();
		});

		it('rejects prompt that is too long', () => {
			const req = {
				body: {
					document_id: '550e8400-e29b-41d4-a716-446655440000',
					query: 'a'.repeat(2001),
				},
			} as Request;
			const res = mockRes();
			middleware(req, res, next);
			expect(res.status).toHaveBeenCalledWith(400);
		});

		it('rejects script injection in query', () => {
			const req = {
				body: {
					document_id: '550e8400-e29b-41d4-a716-446655440000',
					query: '<script>alert("xss")</script>',
				},
			} as Request;
			const res = mockRes();
			middleware(req, res, next);
			expect(res.status).toHaveBeenCalledWith(400);
		});

		it('rejects invalid UUID for document_id', () => {
			const req = {
				body: { document_id: 'not-a-uuid', query: 'Valid question here?' },
			} as Request;
			const res = mockRes();
			middleware(req, res, next);
			expect(res.status).toHaveBeenCalledWith(400);
		});
	});
});
