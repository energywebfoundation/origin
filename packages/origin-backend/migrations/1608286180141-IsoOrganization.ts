import { MigrationInterface, QueryRunner } from 'typeorm';
import { Countries } from '@energyweb/utils-general';

type OldOrg = {
    id: number;
    country: number;
    signatoryCountry: number;
};

type NewOrg = {
    id: number;
    country: string;
    signatoryCountry: string;
};

export class IsoOrganization1608286180141 implements MigrationInterface {
    name = 'IsoOrganization1608286180141';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const organizations: OldOrg[] = await queryRunner.query(
            `SELECT "id", "country", "signatoryCountry" FROM "platform_organization"`
        );

        const ids: Set<number> = organizations.reduce((set, org) => {
            set.add(org.country);
            set.add(org.signatoryCountry);
            return set;
        }, new Set<number>());

        // Add new columns
        await queryRunner.query(
            `ALTER TABLE "platform_organization" ADD "countryCode" character varying`
        );
        await queryRunner.query(
            `ALTER TABLE "platform_organization" ADD "signatoryCountryCode" character varying`
        );

        // Update new columns
        for (const countryId of ids) {
            const countryCode: string = Countries.find((c) => c.id === countryId).code;
            await queryRunner.query(
                `UPDATE "platform_organization" SET "countryCode"='${countryCode}' WHERE "country"=${countryId}`
            );
            await queryRunner.query(
                `UPDATE "platform_organization" SET "signatoryCountryCode"='${countryCode}' WHERE "signatoryCountry"=${countryId}`
            );
        }

        // Drop old columns
        await queryRunner.query(`ALTER TABLE "platform_organization" DROP COLUMN "country"`);
        await queryRunner.query(
            `ALTER TABLE "platform_organization" DROP COLUMN "signatoryCountry"`
        );

        // Rename new columns
        await queryRunner.query(
            `ALTER TABLE "platform_organization" RENAME COLUMN "countryCode" to "country"`
        );
        await queryRunner.query(
            `ALTER TABLE "platform_organization" RENAME COLUMN "signatoryCountryCode" to  "signatoryCountry"`
        );

        // Add NOT NULL constraint
        await queryRunner.query(
            `ALTER TABLE "platform_organization" ALTER COLUMN "country" SET NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "platform_organization" ALTER COLUMN "signatoryCountry" SET NOT NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const organizations: NewOrg[] = await queryRunner.query(
            `SELECT "id", "country", "signatoryCountry" FROM "platform_organization"`
        );

        const codes: Set<string> = organizations.reduce((set, org) => {
            set.add(org.country);
            set.add(org.signatoryCountry);
            return set;
        }, new Set<string>());

        // Add new columns
        await queryRunner.query(`ALTER TABLE "platform_organization" ADD "countryId" integer`);
        await queryRunner.query(
            `ALTER TABLE "platform_organization" ADD "signatoryCountryId" integer`
        );

        // Update new columns
        for (const code of codes) {
            const countryId: number = Countries.find((c) => c.code === code).id;
            await queryRunner.query(
                `UPDATE "platform_organization" SET "countryId"=${countryId} WHERE "country"='${code}'`
            );
            await queryRunner.query(
                `UPDATE "platform_organization" SET "signatoryCountryId"=${countryId} WHERE "signatoryCountry"='${code}'`
            );
        }

        // Drop old columns
        await queryRunner.query(`ALTER TABLE "platform_organization" DROP COLUMN "country"`);
        await queryRunner.query(
            `ALTER TABLE "platform_organization" DROP COLUMN "signatoryCountry"`
        );

        // Rename new columns
        await queryRunner.query(
            `ALTER TABLE "platform_organization" RENAME COLUMN "countryId" to "country"`
        );
        await queryRunner.query(
            `ALTER TABLE "platform_organization" RENAME COLUMN "signatoryCountryId" to  "signatoryCountry"`
        );

        // Add NOT NULL constraint
        await queryRunner.query(
            `ALTER TABLE "platform_organization" ALTER COLUMN "country" SET NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "platform_organization" ALTER COLUMN "signatoryCountry" SET NOT NULL`
        );
    }
}
