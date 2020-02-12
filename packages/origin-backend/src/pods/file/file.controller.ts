import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import {
    Controller,
    Post,
    UploadedFiles,
    BadRequestException,
    UseInterceptors,
    Get,
    Res,
    Param
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { FILE_SUPPORTED_MIMETYPES } from '@energyweb/origin-backend-core';

const FILES_LOCATION = path.join(__dirname, '/../../../uploads');

const storage = multer.diskStorage({
    destination: FILES_LOCATION,

    filename(req, file, cb) {
        crypto.pseudoRandomBytes(10, (err, raw) => {
            if (err) {
                return cb(err, null);
            }

            return cb(null, raw.toString('hex') + path.extname(file.originalname));
        });
    }
});

@Controller('file')
export class FileController {
    @Post()
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'files', maxCount: 20 }], {
            storage,
            fileFilter: (req: Request, file, callback) => {
                if (!FILE_SUPPORTED_MIMETYPES.includes(file.mimetype)) {
                    callback(new Error('Unsupported file type'), false);
                }

                callback(null, true);
            }
        })
    )
    async post(
        @UploadedFiles()
        uploadedFiles: {
            files: Express.Multer.File[];
        }
    ) {
        const { files } = uploadedFiles;

        if (typeof files === 'undefined') {
            throw new BadRequestException('files.files array has to be defined.');
        }

        return files.map(f => f.filename);
    }

    @Get(':id')
    test(@Param('id') id: string, @Res() res: Response) {
        return res.sendFile(path.join(FILES_LOCATION, id));
    }
}
