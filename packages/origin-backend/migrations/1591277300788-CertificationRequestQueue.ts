import { MigrationInterface, QueryRunner } from 'typeorm';

export class CertificationRequestQueue1591277300788 implements MigrationInterface {
    name = 'CertificationRequestQueue1591277300788';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "certification_request_queue_item" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "energy" character varying NOT NULL, "deviceId" character varying NOT NULL, "fromTime" integer NOT NULL, "toTime" integer NOT NULL, "files" text, CONSTRAINT "UQ_35e7caf2cdf113495db6b41f9ec" UNIQUE ("deviceId", "fromTime", "toTime"), CONSTRAINT "PK_fce0a493b5cd9e42ad2e3e8ee82" PRIMARY KEY ("id"))`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "certification_request_queue_item"`);
    }
}
