import { LoggedInUser, Role } from '@energyweb/origin-backend-core';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import path from 'path';
import { Connection, IsNull, Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { File } from './file.entity';

export type FileUpload = {
    originalname: string;
    buffer: Buffer;
    mimetype: string;
};

export class FileService {
    private readonly logger = new Logger(FileService.name);

    constructor(
        @InjectRepository(File) private readonly repository: Repository<File>,
        private readonly connection: Connection
    ) {}

    public async store(
        user: LoggedInUser,
        files: FileUpload[],
        isPublic = false
    ): Promise<string[]> {
        this.logger.debug(`User ${JSON.stringify(user)} requested store for ${files.length} files`);

        const storedFile: string[] = [];
        await this.connection.transaction(async (entityManager) => {
            for (const file of files) {
                const fileToStore = new File({
                    filename: this.generateUniqueFilename(file.originalname),
                    data: file.buffer,
                    contentType: file.mimetype,
                    userId: user.id.toString(),
                    organizationId: user.organizationId?.toString(),
                    isPublic
                });
                await entityManager.insert<File>(File, fileToStore);

                storedFile.push(fileToStore.id);
            }
        });
        this.logger.debug(`User ${JSON.stringify(user)} has stored ${JSON.stringify(storedFile)}`);

        return storedFile;
    }

    public async get(id: string, user: LoggedInUser = null): Promise<File> {
        this.logger.debug(`User ${JSON.stringify(user)} requested file ${id}`);

        if (user) {
            if (user.hasRole(Role.Admin, Role.SupportAgent, Role.Issuer)) {
                return this.repository.findOne(id);
            }

            return this.repository.findOne(id, {
                where: {
                    userId: user.id.toString(),
                    organizationId: user.organizationId?.toString()
                }
            });
        }

        return this.repository.findOne(id, {
            where: {
                isPublic: true
            }
        });
    }

    public async isOwner(user: LoggedInUser, ids: string[]): Promise<boolean> {
        this.logger.debug(
            `User ${JSON.stringify(user)} requested ownership check for ${JSON.stringify(ids)}`
        );

        let isOwner = true;

        for (const documentId of ids) {
            const count = await this.repository.count({
                where: [
                    {
                        id: documentId,
                        userId: user.id.toString(),
                        organizationId: user.organizationId?.toString()
                    },
                    {
                        id: documentId,
                        userId: user.id.toString(),
                        organizationId: IsNull()
                    }
                ]
            });

            this.logger.debug(
                `Found ${count} documents matching user ID ${user.id} and org ID ${user.organizationId}`
            );

            if (count == 0) {
                isOwner = false;
                break;
            }
        }

        this.logger.debug(
            `User ${JSON.stringify(user)} ownership for ${JSON.stringify(ids)} returns ${isOwner}}`
        );

        return isOwner;
    }

    public async updateOrganization(user: LoggedInUser, ids: string[]): Promise<void> {
        if (!ids) {
            return;
        }
        if (!user.hasOrganization) {
            throw new Error('User is not part of the organization');
        }

        await this.connection.transaction(async (entityManager) => {
            for (const id of ids) {
                await entityManager.update<File>(
                    File,
                    { id, userId: user.id.toString() },
                    { organizationId: user.organizationId.toString() }
                );
            }
        });
    }

    private generateUniqueFilename(originalFilename: string) {
        return `${uuid()}.${path.extname(originalFilename)}`;
    }
}
