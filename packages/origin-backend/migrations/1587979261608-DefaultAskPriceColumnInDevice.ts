import { MigrationInterface, QueryRunner } from 'typeorm';

export class DefaultAskPriceColumnInDevice1587979261608 implements MigrationInterface {
    name = 'DefaultAskPriceColumnInDevice1587979261608';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "device" ADD "defaultAskPrice" integer`, undefined);
        await queryRunner.query(
            `ALTER TABLE "certification_request" ALTER COLUMN "id" DROP DEFAULT`,
            undefined
        );
        await queryRunner.query(`DROP SEQUENCE "certification_request_id_seq"`, undefined);
        await queryRunner.query(
            `ALTER TABLE "certification_request" ALTER COLUMN "energy" TYPE character varying`,
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "certification_request" ALTER COLUMN "energy" TYPE bigint`,
            undefined
        );
        await queryRunner.query(
            `CREATE SEQUENCE "certification_request_id_seq" OWNED BY "certification_request"."id"`,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "certification_request" ALTER COLUMN "id" SET DEFAULT nextval('certification_request_id_seq')`,
            undefined
        );
        await queryRunner.query(`ALTER TABLE "device" DROP COLUMN "defaultAskPrice"`, undefined);
    }
}
