import { getPool } from '../db/postgres';
import { QueryLog } from '../models/QueryLog';

export interface PaginationParams {
	page: number;
	limit: number;
}

export interface PaginatedResult<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		pages: number;
	};
}

export async function getQueryLogs(params: PaginationParams) {
	const { page, limit } = params;
	const skip = (page - 1) * limit;

	const [logs, total] = await Promise.all([
		QueryLog.find().sort({ created_at: -1 }).skip(skip).limit(limit),
		QueryLog.countDocuments(),
	]);

	return {
		data: logs,
		pagination: { page, limit, total, pages: Math.ceil(total / limit) },
	};
}

export async function getStats() {
	const [totalQueries, totalUsers, totalDocs, avgLatency, tokenSum] =
		await Promise.all([
			QueryLog.countDocuments(),
			getPool().query('SELECT COUNT(*) FROM users'),
			getPool().query('SELECT COUNT(*) FROM documents'),
			QueryLog.aggregate([
				{ $group: { _id: null, avg: { $avg: '$latency_ms' } } },
			]),
			QueryLog.aggregate([
				{ $group: { _id: null, sum: { $sum: '$tokens_used' } } },
			]),
		]);

	const queriesPerDay = await QueryLog.aggregate([
		{
			$match: {
				created_at: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
			},
		},
		{
			$group: {
				_id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
				count: { $sum: 1 },
			},
		},
		{ $sort: { _id: 1 } },
	]);

	return {
		totalQueries,
		totalUsers: parseInt(totalUsers.rows[0].count),
		totalDocuments: parseInt(totalDocs.rows[0].count),
		avgLatencyMs: Math.round(avgLatency[0]?.avg ?? 0),
		totalTokensUsed: tokenSum[0]?.sum ?? 0,
		queriesPerDay,
	};
}
