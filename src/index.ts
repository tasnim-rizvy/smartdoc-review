import 'dotenv/config';
import app from "./app";
import { connectMongo } from './db/mongo';
import { connectPostgres, runMigrations } from './db/postgres';
import { connectRedis } from './db/redis';

const PORT = process.env.PORT || 8000

async function startServer() {
    await connectMongo();
    await connectPostgres();
    await runMigrations();
    await connectRedis();

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
}

startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});