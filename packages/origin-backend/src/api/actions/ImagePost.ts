import { Request, Response } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import { STATUS_CODES } from '../../enums/StatusCodes';

const storage = multer.diskStorage({
    destination: path.join(__dirname, '/../../../uploads'),

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

    if (typeof files === 'undefined') {
        return res.status(STATUS_CODES.BAD_REQUEST).send('req.files array has to be defined.');
    }

    return res.send(files.map(f => f.filename));
}

export const imagePostActions = [upload.array('images', 10), action];
