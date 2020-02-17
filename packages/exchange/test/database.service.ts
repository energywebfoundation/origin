import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Injectable()
export class DatabaseService {
    constructor(
        @InjectConnection('ExchangeConnection')
        private readonly connection: Connection
    ) {}

    public async cleanUp() {
        const tables = this.connection.entityMetadatas.map(e => `"${e.tableName}"`).join(', ');

        try {
            await this.connection.query(`TRUNCATE ${tables} CASCADE;`);
        } catch (error) {
            throw new Error(`ERROR: Cleaning test db: ${error}`);
        }
    }
}
