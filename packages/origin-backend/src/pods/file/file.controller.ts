import { FILE_SUPPORTED_MIMETYPES } from '@energyweb/origin-backend-core';
import { Controller, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import multer from 'multer';

import { FileService } from './file.service';

const maxFilesLimit = parseInt(process.env.FILE_MAX_FILES, 10) || 20;
const maxFileSize = parseInt(process.env.FILE_MAX_FILE_SIZE, 10) || 10485760;

@Controller('file')
export class FileController {
    constructor(private readonly fileService: FileService) {}

    @Post()
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'files', maxCount: maxFilesLimit }], {
            storage: multer.memoryStorage(),
            fileFilter: (req: Request, file, callback) => {
                if (!FILE_SUPPORTED_MIMETYPES.includes(file.mimetype)) {
                    callback(new Error('Unsupported file type'), false);
                }

                callback(null, true);
            },
            limits: {
                files: maxFilesLimit,
                fileSize: maxFileSize
            }
        })
    )
    @UseGuards(AuthGuard())
    async upload(
        @UploadedFiles()
        uploadedFiles: {
            files: Express.Multer.File[];
        }
    ): Promise<string[]> {
        const ids = await this.fileService.store(uploadedFiles.files);

        return ids;
    }
}
