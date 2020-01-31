import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import {
    Controller,
    Post,
    UploadedFiles,
    BadRequestException,
    UseInterceptors
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

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

@Controller('image')
export class ImageController {
    @Post()
    @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 10 }], { storage }))
    async post(
        @UploadedFiles()
        files: {
            images: Express.Multer.File[];
        }
    ) {
        const { images } = files;

        if (typeof images === 'undefined') {
            throw new BadRequestException('files.images array has to be defined.');
        }

        return images.map(f => f.filename);
    }
}
