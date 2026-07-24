import { Request } from 'express';

export interface AuthUser {
	id: string;
	email: string;
	role: 'user' | 'admin';
}

export interface AuthRequest extends Request {
	user?: AuthUser;
}

export interface RAGResult {
	stream: AsyncIterable<string>;
	chunksRetrieved: number;
}
