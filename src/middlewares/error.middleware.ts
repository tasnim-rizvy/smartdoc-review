import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
	status?: number;
	code?: string;
}

export function errorHandler(
	err: AppError,
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	const status = err.status || 500;
	const message = status === 500 ? 'Internal server error' : err.message;

	if (status === 500) console.error('Unhandled error:', err);

	res.status(status).json({ message, ...(err.code && { code: err.code }) });
}

export function createError(
	message: string,
	status: number = 500,
	code?: string,
): AppError {
	const err: AppError = new Error(message);
	err.status = status;
	if (code) err.code = code;

	return err;
}
