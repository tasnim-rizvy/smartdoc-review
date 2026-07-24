import fs from 'fs';

process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.UPLOAD_DIR = '/tmp/smartdoc-test-uploads';
process.env.RATE_LIMIT_WINDOW_MS = '60000';
process.env.RATE_LIMIT_MAX_REQUESTS = '10';
process.env.NODE_ENV = 'test';

if (!fs.existsSync('/tmp/smartdoc-test-uploads')) {
	fs.mkdirSync('/tmp/smartdoc-test-uploads', { recursive: true });
}
