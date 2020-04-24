/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { MigrationInterface, QueryRunner } from 'typeorm';
import fs from 'fs';
import path from 'path';

export class Initial1586949939455 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        const table = await queryRunner.getTable('asset');

        if (table) {
            console.log('asset table exists. assuming initial migration was completed before');
            return;
        }

        const initialPath = path.resolve(__dirname, './initial.sql');
        const initialSqlFile = fs.readFileSync(initialPath).toString();

        await queryRunner.query(initialSqlFile);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {}
}
