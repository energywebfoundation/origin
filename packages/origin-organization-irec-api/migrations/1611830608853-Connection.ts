import { MigrationInterface, QueryRunner } from 'typeorm';

export class Connection1611830608853 implements MigrationInterface {
    name = 'Connection1611830608853';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "irec_connection" 
            (
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "accessToken" character varying NOT NULL, 
                "refreshToken" character varying NOT NULL, 
                "expiryDate" TIMESTAMP WITH TIME ZONE NOT NULL, 
                CONSTRAINT "PK_db33df0c2f26b5a0e9bd52ee2db" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "irec_connection"`);
    }
}
