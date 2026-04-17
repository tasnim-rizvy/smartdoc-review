import mongoose, { Schema, Document } from 'mongoose';

export interface IQueryLog extends Document {
	user_id: string;
	document_id: string;
	prompt: string;
	prompt_hash: string;
	response_preview: string;
	tokens_used: number;
	latency_ms: number;
	chunks_retrieved: number;
	rate_limited: boolean;
	created_at: Date;
}

const QueryLogSchema = new Schema<IQueryLog>({
	user_id: { type: String, required: true, index: true },
	document_id: { type: String, required: true },
	prompt: { type: String, required: true },
	prompt_hash: { type: String, required: true },
	response_preview: { type: String, default: '' },
	tokens_used: { type: Number, default: 0 },
	latency_ms: { type: Number, default: 0 },
	chunks_retrieved: { type: Number, default: 0 },
	rate_limited: { type: Boolean, default: false },
	created_at: { type: Date, default: Date.now },
});

export const QueryLog = mongoose.model<IQueryLog>('QueryLog', QueryLogSchema);
