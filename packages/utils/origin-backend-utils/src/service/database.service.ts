import { Injectable } from '@nestjs/common';
import polly from 'polly-js';
import { Connection } from 'typeorm';

@Injectable()
export class DatabaseService {
    constructor(private readonly connection: Connection) {}

    public async cleanUp(): Promise<void> {
        const tables = this.connection.entityMetadatas.map((e) => `"${e.tableName}"`).join(', ');

        try {
            await polly()
                .waitAndRetry(3)
                .executeForPromise(() => this.connection.query(`TRUNCATE ${tables} CASCADE;`));
        } catch (error) {
            throw new Error(`ERROR: Cleaning test db: ${error}`);
        }
    }

    public async truncate(...tables: string[]): Promise<void> {
        for (const table of tables) {
            await this.connection.query(`TRUNCATE "${table}" CASCADE;`);
        }
    }

    public async query(query: string): Promise<void> {
        await this.connection.query(query);
    }
}
