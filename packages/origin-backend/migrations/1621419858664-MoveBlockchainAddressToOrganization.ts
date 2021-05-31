import { MigrationInterface, QueryRunner } from 'typeorm';

export class MoveBlockchainAddressToOrganization1621419858664 implements MigrationInterface {
    name = 'MoveBlockchainAddressToOrganization1621419858664';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const oldUsers = await queryRunner.query(
            `SELECT id, "organizationId", "blockchainAccountAddress", "blockchainAccountSignedMessage" FROM "user"`
        );

        await queryRunner.query(
            `ALTER TABLE "user" DROP CONSTRAINT "UQ_3e71ea3e520c84b9d9ec1199432"`
        );
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "blockchainAccountAddress"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "blockchainAccountSignedMessage"`);

        await queryRunner.query(
            `ALTER TABLE "platform_organization" ADD "blockchainAccountAddress" character varying`
        );
        await queryRunner.query(
            `ALTER TABLE "platform_organization" ADD CONSTRAINT "UQ_b8616133682a5682225b3fd40ec" UNIQUE ("blockchainAccountAddress")`
        );
        await queryRunner.query(
            `ALTER TABLE "platform_organization" ADD "blockchainAccountSignedMessage" character varying`
        );

        oldUsers.forEach(async (oldUser: any) => {
            if (!oldUser.blockchainAccountAddress) {
                return;
            }

            await queryRunner.query(
                `UPDATE "platform_organization" SET "blockchainAccountAddress" = '${oldUser.blockchainAccountAddress}', "blockchainAccountSignedMessage" = '${oldUser.blockchainAccountSignedMessage}' WHERE id = '${oldUser.organizationId}'`
            );
        });
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const oldOrganizations = await queryRunner.query(
            `SELECT id, "blockchainAccountAddress", "blockchainAccountSignedMessage" FROM "platform_organization"`
        );

        await queryRunner.query(
            `ALTER TABLE "platform_organization" DROP COLUMN "blockchainAccountSignedMessage"`
        );
        await queryRunner.query(
            `ALTER TABLE "platform_organization" DROP CONSTRAINT "UQ_b8616133682a5682225b3fd40ec"`
        );
        await queryRunner.query(
            `ALTER TABLE "platform_organization" DROP COLUMN "blockchainAccountAddress"`
        );

        await queryRunner.query(
            `ALTER TABLE "user" ADD "blockchainAccountSignedMessage" character varying`
        );
        await queryRunner.query(
            `ALTER TABLE "user" ADD "blockchainAccountAddress" character varying`
        );
        await queryRunner.query(
            `ALTER TABLE "user" ADD CONSTRAINT "UQ_3e71ea3e520c84b9d9ec1199432" UNIQUE ("blockchainAccountAddress")`
        );

        oldOrganizations.forEach(async (oldOrganization: any) => {
            if (!oldOrganization.blockchainAccountAddress) {
                return;
            }

            await queryRunner.query(
                `UPDATE "user" SET "blockchainAccountAddress" = '${oldOrganization.blockchainAccountAddress}', "blockchainAccountSignedMessage" = '${oldOrganization.blockchainAccountSignedMessage}' WHERE "organizationId" = '${oldOrganization.id}'`
            );
        });
    }
}
