import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types";

interface UploadRequest extends AuthRequest {
    file?: Express.Multer.File;
}

export async function upload(req: UploadRequest, res: Response, next: NextFunction) {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const userId = req.user?.id;
        const { filename, path: filepath, size } = req.file

        
    } catch (error) {
        next(error);
    }
}

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
    try {

    } catch (error) {
        next(error);
    }
}

export async function get(req: AuthRequest, res: Response, next: NextFunction) {
    try {

    } catch (error) {
        next(error);
    }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {

    } catch (error) {
        next(error);
    }
}