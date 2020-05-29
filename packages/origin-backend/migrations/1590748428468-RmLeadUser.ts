import { MigrationInterface, QueryRunner } from 'typeorm';

export class RmLeadUser1590748428468 implements MigrationInterface {
    name = 'RmLeadUser1590748428468';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            `ALTER TABLE "organization" DROP CONSTRAINT "FK_b57ff7e8249b18beb91d9965fd4"`,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "organization" DROP CONSTRAINT "REL_b57ff7e8249b18beb91d9965fd"`,
            undefined
        );
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "leadUserId"`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "organization" ADD "leadUserId" integer`, undefined);
        await queryRunner.query(
            `ALTER TABLE "organization" ADD CONSTRAINT "REL_b57ff7e8249b18beb91d9965fd" UNIQUE ("leadUserId")`,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "organization" ADD CONSTRAINT "FK_b57ff7e8249b18beb91d9965fd4" FOREIGN KEY ("leadUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            undefined
        );
    }
}
