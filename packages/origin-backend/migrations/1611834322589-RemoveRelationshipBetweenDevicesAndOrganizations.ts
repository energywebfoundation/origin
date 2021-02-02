import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveRelationshipBetweenDevicesAndOrganizations1611834322589
    implements MigrationInterface {
    name = 'RemoveRelationshipBetweenDevicesAndOrganizations1611834322589';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "device" DROP CONSTRAINT "FK_c48c741b40e9f453eb1602928d6"`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "device" ADD CONSTRAINT "FK_c48c741b40e9f453eb1602928d6" FOREIGN KEY ("organizationId") REFERENCES "platform_organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }
}
