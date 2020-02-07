import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Injectable()
export class DatabaseService {
    private readonly logger = new Logger(DatabaseService.name);

    constructor(
        @InjectConnection()
        private readonly connection: Connection
    ) {}

    public async cleanUp() {
        const tables = this.connection.entityMetadatas.map(e => `"${e.tableName}"`).join(', ');

        try {
            // const repository = this.connection.getRepository(entity.name);
            await this.connection.query(`TRUNCATE ${tables} CASCADE;`);
        } catch (error) {
            throw new Error(`ERROR: Cleaning test db: ${error}`);
        }
    }
}
