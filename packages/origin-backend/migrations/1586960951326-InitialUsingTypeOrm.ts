import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialUsingTypeOrm1586960951326 implements MigrationInterface {
    name = 'InitialUsingTypeOrm1586960951326';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE "certification_request" ALTER COLUMN "energy" TYPE BIGINT'
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE "certification_request" ALTER COLUMN "energy" TYPE integer'
        );
    }
}
