import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialUsingTypeOrm1586956731982 implements MigrationInterface {
    name = 'InitialUsingTypeOrm1586956731982';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            `CREATE TABLE "supply" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "price" integer NOT NULL, "start" TIMESTAMP WITH TIME ZONE NOT NULL, "volumePerPeriod" integer NOT NULL, "periods" integer NOT NULL, "timeFrame" integer, "product" json NOT NULL, CONSTRAINT "PK_11dcdc2def0eb6d10ed3ae0180d" PRIMARY KEY ("id"))`,
            undefined
        );
        await queryRunner.query(
            `CREATE TABLE "supply_asks_order" ("supplyId" uuid NOT NULL, "orderId" uuid NOT NULL, CONSTRAINT "PK_b4ca49b8640240a945378497106" PRIMARY KEY ("supplyId", "orderId"))`,
            undefined
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_eae454e1165015cef904a60ce2" ON "supply_asks_order" ("supplyId") `,
            undefined
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_314fc5fe32ee51cf6ec5feb577" ON "supply_asks_order" ("orderId") `,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "supply_asks_order" ADD CONSTRAINT "FK_eae454e1165015cef904a60ce28" FOREIGN KEY ("supplyId") REFERENCES "supply"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "supply_asks_order" ADD CONSTRAINT "FK_314fc5fe32ee51cf6ec5feb5774" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            `ALTER TABLE "supply_asks_order" DROP CONSTRAINT "FK_314fc5fe32ee51cf6ec5feb5774"`,
            undefined
        );
        await queryRunner.query(
            `ALTER TABLE "supply_asks_order" DROP CONSTRAINT "FK_eae454e1165015cef904a60ce28"`,
            undefined
        );
        await queryRunner.query(`DROP INDEX "IDX_314fc5fe32ee51cf6ec5feb577"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_eae454e1165015cef904a60ce2"`, undefined);
        await queryRunner.query(`DROP TABLE "supply_asks_order"`, undefined);
        await queryRunner.query(`DROP TABLE "supply"`, undefined);
    }
}
