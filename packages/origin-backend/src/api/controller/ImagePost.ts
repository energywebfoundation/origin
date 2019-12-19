import { Request, Response } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';

const storage = multer.diskStorage({
    destination: './uploads/',

    filename(req, file, cb) {
        crypto.pseudoRandomBytes(10, (err, raw) => {
            if (err) {
                return cb(err, null);
            }

            return cb(null, raw.toString('hex') + path.extname(file.originalname));
        });
    }
});

const upload = multer({ storage });

async function action(req: Request, res: Response) {
    console.log(`POST - Image`);

    const files = req.files as Express.Multer.File[];

    return res.send(files.map(f => f.filename));
}

export const imagePostActions = [upload.array('images', 10), action];
