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
                "registrationId" uuid,
                CONSTRAINT "PK_db33df0c2f26b5a0e9bd52ee2db" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "irec_connection" 
                ADD CONSTRAINT "UQ_connection_registrationId" 
                UNIQUE ("registrationId")
        `);
        await queryRunner.query(`
            ALTER TABLE "irec_connection" 
                ADD CONSTRAINT "FK_connection_registrationId" 
                FOREIGN KEY ("registrationId") 
                REFERENCES "irec_registration"("id") 
                ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "irec_connection" DROP CONSTRAINT "FK_connection_registrationId"`
        );
        await queryRunner.query(
            `ALTER TABLE "irec_connection" DROP CONSTRAINT "UQ_connection_registrationId"`
        );
        await queryRunner.query(`DROP TABLE "irec_connection"`);
    }
}
