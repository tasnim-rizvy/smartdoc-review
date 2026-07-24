import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { getQueryLogs, getStats as fetchStats } from '../services/admin.service';

export async function getLogs(
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) {
	try {
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 50;

		const result = await getQueryLogs({ page, limit });
		res.json(result);
	} catch (err) {
		next(err);
	}
}

export async function getStats(
	_req: AuthRequest,
	res: Response,
	next: NextFunction,
) {
	try {
		const stats = await fetchStats();
		res.json(stats);
	} catch (err) {
		next(err);
	}
}
