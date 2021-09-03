import { MigrationInterface, QueryRunner } from 'typeorm';

export class UniqueOwner1629965867114 implements MigrationInterface {
    name = 'UniqueOwner1629965867114';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_registration" ADD CONSTRAINT "UQ_irec_registration_owner" UNIQUE ("owner")`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_registration" DROP CONSTRAINT "UQ_irec_registration_owner"`
        );
    }
}
