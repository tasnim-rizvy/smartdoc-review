import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export function validate(schema: ZodSchema) {
	return (req: Request, res: Response, next: NextFunction) => {
		const result = schema.safeParse(req.body);
		if (!result.success) {
			return res.status(400).json({
				message: 'Invalid request data',
				errors: result.error.flatten().fieldErrors,
			});
		}
		req.body = result.data;
		next();
	};
}

export const registerSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const loginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(1, 'Password is required'),
});

export const querySchema = z.object({
	query: z
		.string()
		.min(3, 'Query must be at least 3 characters long')
		.max(2000, 'Too long query (2000 chars max)')
		.refine(
			(val) => !/<script|javascript:|on\w+=/i.test(val),
			'Prompt contains disallowed content',
		),
	document_id: z.string().uuid('Invalid document ID'),
});
