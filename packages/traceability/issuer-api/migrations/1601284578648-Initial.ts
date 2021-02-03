import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1601284578648 implements MigrationInterface {
    name = 'Initial1601284578648';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "issuer_blockchain_properties" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "netId" integer NOT NULL, "registry" character varying NOT NULL, "issuer" character varying NOT NULL, "rpcNode" character varying NOT NULL, "platformOperatorPrivateKey" character varying NOT NULL, "rpcNodeFallback" character varying, CONSTRAINT "PK_28a5da3125367f7bbea266f8d00" PRIMARY KEY ("netId"))`
        );
        await queryRunner.query(
            `CREATE TABLE "issuer_certificate" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "tokenId" integer NOT NULL, "deviceId" character varying NOT NULL, "generationStartTime" integer NOT NULL, "generationEndTime" integer NOT NULL, "creationTime" integer NOT NULL, "creationBlockHash" character varying NOT NULL, "owners" text NOT NULL, "claimers" text, "claims" text, "latestCommitment" text, "issuedPrivately" boolean NOT NULL, "blockchainNetId" integer, CONSTRAINT "UQ_6489c34207c69cdc7b90afb4491" UNIQUE ("tokenId"), CONSTRAINT "PK_e4ce09f2a73bbe3a7227df421e7" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "issuer_certification_request" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "requestId" integer NOT NULL, "owner" character varying NOT NULL, "energy" character varying NOT NULL, "deviceId" character varying NOT NULL, "fromTime" integer NOT NULL, "toTime" integer NOT NULL, "files" text NOT NULL DEFAULT '[]', "created" integer NOT NULL, "approved" boolean NOT NULL, "approvedDate" TIMESTAMP WITH TIME ZONE, "revoked" boolean NOT NULL, "revokedDate" TIMESTAMP WITH TIME ZONE, "issuedCertificateTokenId" integer, "isPrivate" boolean NOT NULL, CONSTRAINT "UQ_551869cc9ee5caeccd53c966cdd" UNIQUE ("requestId"), CONSTRAINT "PK_126b742d59e12ccc099febcbc1e" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `ALTER TABLE "issuer_certificate" ADD CONSTRAINT "FK_c4a22b2b6eba132040ac17abc8d" FOREIGN KEY ("blockchainNetId") REFERENCES "issuer_blockchain_properties"("netId") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "issuer_certificate" DROP CONSTRAINT "FK_c4a22b2b6eba132040ac17abc8d"`
        );
        await queryRunner.query(`DROP TABLE "issuer_certification_request"`);
        await queryRunner.query(`DROP TABLE "issuer_certificate"`);
        await queryRunner.query(`DROP TABLE "issuer_blockchain_properties"`);
    }
}
