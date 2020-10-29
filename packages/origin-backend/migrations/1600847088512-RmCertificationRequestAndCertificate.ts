import { MigrationInterface, QueryRunner } from 'typeorm';

export class RmCertificationRequestAndCertificate1600847088512 implements MigrationInterface {
    name = 'RmCertificationRequestAndCertificate1600847088512';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "ownership_commitment" CASCADE`);
        await queryRunner.query(`DROP TABLE "certification_request_queue_item" CASCADE`);
        await queryRunner.query(`DROP TABLE "certification_request" CASCADE`);
        await queryRunner.query(`DROP TABLE "certificate" CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "certificate" ("createdAt" timestamp with time zone DEFAULT now() NOT NULL, "updatedAt" timestamp with time zone DEFAULT now() NOT NULL, id integer NOT NULL, "currentOwnershipCommitmentRootHash" character varying, "pendingOwnershipCommitmentRootHash" character varying)`
        );
        await queryRunner.query(
            `CREATE TABLE "certification_request" ("createdAt" timestamp with time zone DEFAULT now() NOT NULL, "updatedAt" timestamp with time zone DEFAULT now() NOT NULL, id integer NOT NULL, energy integer NOT NULL, files text NOT NULL)`
        );
        await queryRunner.query(
            `CREATE TABLE "certification_request_queue_item" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "energy" character varying NOT NULL, "deviceId" character varying NOT NULL, "fromTime" integer NOT NULL, "toTime" integer NOT NULL, "files" text, CONSTRAINT "UQ_35e7caf2cdf113495db6b41f9ec" UNIQUE ("deviceId", "fromTime", "toTime"), CONSTRAINT "PK_fce0a493b5cd9e42ad2e3e8ee82" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "ownership_commitment" ("createdAt" timestamp with time zone DEFAULT now() NOT NULL, "updatedAt" timestamp with time zone DEFAULT now() NOT NULL, "rootHash" character varying NOT NULL, commitment text NOT NULL, leafs text NOT NULL, salts text NOT NULL, "txHash" character varying NOT NULL, "certificateId" integer)`
        );
    }
}
