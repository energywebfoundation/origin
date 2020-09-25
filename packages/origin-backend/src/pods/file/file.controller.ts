import { FILE_SUPPORTED_MIMETYPES, ILoggedInUser } from '@energyweb/origin-backend-core';
import { UserDecorator } from '@energyweb/origin-backend-utils';
import {
    Controller,
    Get,
    NotFoundException,
    Param,
    Post,
    Res,
    UploadedFiles,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
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
        @UserDecorator() user: ILoggedInUser,
        @UploadedFiles()
        uploadedFiles: {
            files: Express.Multer.File[];
        }
    ): Promise<string[]> {
        return this.fileService.store(user, uploadedFiles.files);
    }

    @Get(':id')
    @UseGuards(AuthGuard())
    async download(
        @UserDecorator() user: ILoggedInUser,
        @Param('id') id: string,
        @Res() res: Response
    ): Promise<void> {
        const file = await this.fileService.get(user, id);
        if (!file) {
            throw new NotFoundException();
        }

        res.set({
            'Content-Type': file.contentType,
            'Content-Length': file.data.length
        }).send(file.data);
    }
}
