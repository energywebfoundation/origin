import { MigrationInterface, QueryRunner } from 'typeorm';

export class DemandUpdates1606405724791 implements MigrationInterface {
    name = 'DemandUpdates1606405724791';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "exchange_demand" ALTER COLUMN "periodTimeFrame" TYPE character varying, ALTER COLUMN "periodTimeFrame" SET NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_demand" ALTER COLUMN "status" TYPE character varying, ALTER COLUMN "status" SET NOT NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "exchange_demand" ALTER COLUMN "status" TYPE integer, ALTER COLUMN "status" SET NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "exchange_demand" ALTER COLUMN "periodTimeFrame" TYPE integer, ALTER COLUMN "periodTimeFrame" SET NOT NULL`
        );
    }
}
