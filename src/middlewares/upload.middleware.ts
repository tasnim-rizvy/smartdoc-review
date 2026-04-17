import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, process.env.UPLOAD_DIR || './uploads');
	},
	filename: (req: Request, file, cb) => {
		const ext = path.extname(file.originalname);
		const filename = `${uuidv4()}${ext}`;
		cb(null, filename);
	},
});

function fileFilter(
	req: Request,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback,
) {
	const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
	if (allowedTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error('Only PDF, JPEG, and PNG files are allowed'));
	}
}

export const uploadMiddleware = multer({
	storage,
	fileFilter,
	limits: { fileSize: 5 * 1024 * 1024 },
});
