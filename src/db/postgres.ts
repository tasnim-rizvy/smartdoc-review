import { Pool } from 'pg';

let pool: Pool;

export function getPool(): Pool {
	if (!pool) {
		pool = new Pool({
			connectionString: process.env.DATABASE_URL,
		});
	}
	return pool;
}

export async function connectPostgres(): Promise<void> {
	const client = await getPool().connect();
	client.release();
	console.log('Connected to PostgreSQL database');
}

export async function runMigrations(): Promise<void> {
	const db = getPool();

	await db.query(`
        CREATE TABLE IF NOT EXISTS users (
            id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email       VARCHAR(255) UNIQUE NOT NULL,
            password    VARCHAR(255) NOT NULL,
            role        VARCHAR(20) DEFAULT 'user',
            created_at  TIMESTAMP DEFAULT NOW()
        );
    `);

	await db.query(`
        CREATE TABLE IF NOT EXISTS documents (
            id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
            filename    VARCHAR(255) NOT NULL,
            filepath    VARCHAR(500) NOT NULL,
            size_bytes  INTEGER DEFAULT 0,
            page_count  INTEGER DEFAULT 0,
            created_at  TIMESTAMP DEFAULT NOW()
        );
    `);

	await db.query(`
        CREATE TABLE IF NOT EXISTS refresh_tokens (
            id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
            token       TEXT UNIQUE NOT NULL,
            expires_at  TIMESTAMP NOT NULL,
            created_at  TIMESTAMP DEFAULT NOW()
        );
    `);

	console.log('✅ Database migrations complete');
}

export async function closePostgres(): Promise<void> {
	await pool?.end();
}
