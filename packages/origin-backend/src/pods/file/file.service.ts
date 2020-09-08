import { InjectRepository } from '@nestjs/typeorm';
import path from 'path';
import { Connection, Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { File } from './file.entity';

export type FileUpload = {
    originalname: string;
    buffer: Buffer;
};

export class FileService {
    constructor(
        @InjectRepository(File) private readonly repository: Repository<File>,
        private readonly connection: Connection
    ) {}

    public async store(files: FileUpload[]): Promise<string[]> {
        const storedFile: string[] = [];
        await this.connection.transaction(async (entityManager) => {
            for (const file of files) {
                const fileToStore = new File({
                    filename: this.generateUniqueFilename(file.originalname),
                    data: file.buffer
                });
                await entityManager.insert<File>(File, fileToStore);

                storedFile.push(fileToStore.id);
            }
        });

        return storedFile;
    }

    public async get(id: string): Promise<File> {
        return this.repository.findOne(id);
    }

    private generateUniqueFilename(originalFilename: string) {
        return `${uuid()}.${path.extname(originalFilename)}`;
    }
}
