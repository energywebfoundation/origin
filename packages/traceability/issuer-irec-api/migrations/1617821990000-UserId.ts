import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserId1617821990000 implements MigrationInterface {
    name = 'UserId1617821990000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "issuer_certification_request" ADD "userId" varchar DEFAULT NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "issuer_certification_request" DROP COLUMN "userId"`);
    }
}
