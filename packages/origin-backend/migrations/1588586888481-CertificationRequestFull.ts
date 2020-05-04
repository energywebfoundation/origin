import { MigrationInterface, QueryRunner } from 'typeorm';

export class CertificationRequestFull1588586888481 implements MigrationInterface {
    name = 'CertificationRequestFull1588586888481';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            `ALTER TABLE "certification_request" ADD "owner" character varying NOT NULL`,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "certification_request" ADD "fromTime" integer NOT NULL`,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "certification_request" ADD "toTime" integer NOT NULL`,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "certification_request" ADD "created" integer NOT NULL`,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "certification_request" ADD "approved" boolean NOT NULL`,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "certification_request" ADD "revoked" boolean NOT NULL`,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "certification_request" ADD "deviceId" integer NOT NULL`,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "certification_request" ALTER COLUMN "energy" DROP NOT NULL`,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "certification_request" ADD CONSTRAINT "FK_020d084fd3476e001534b4782c5" FOREIGN KEY ("deviceId") REFERENCES "device"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "certification_request" ALTER COLUMN "files" DROP NOT NULL`,
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            `ALTER TABLE "certification_request" ALTER COLUMN "files" SET NOT NULL`,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "certification_request" DROP CONSTRAINT "FK_020d084fd3476e001534b4782c5"`,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "certification_request" ALTER COLUMN "energy" SET NOT NULL`,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "certification_request" DROP COLUMN "deviceId"`,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "certification_request" DROP COLUMN "revoked"`,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "certification_request" DROP COLUMN "approved"`,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "certification_request" DROP COLUMN "created"`,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "certification_request" DROP COLUMN "toTime"`,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "certification_request" DROP COLUMN "fromTime"`,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "certification_request" DROP COLUMN "owner"`,
            undefined
        );
    }
}
