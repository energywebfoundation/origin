/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-extraneous-dependencies */
import { HttpStatus, INestApplication } from '@nestjs/common';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import supertest from 'supertest';
import { bootstrapTestInstance, TestUser } from './test.app';
import { request } from './request';

describe('I-REC Beneficiary tests', () => {
    let app: INestApplication;
    let databaseService: DatabaseService;
    let test: supertest.SuperTest<supertest.Test>;

    before(async () => {
        ({ app, databaseService } = await bootstrapTestInstance());

        await app.init();

        test = request(app);

        databaseService.query(`
            INSERT INTO public."irec_beneficiary"
                ("id", "irecBeneficiaryId", "organizationId", "ownerOrganizationId", "active")
            VALUES 
                (1, 1, 1000,  1, true);
        `);
    });

    after(async () => {
        await databaseService.cleanUp();
        await app.close();
    });

    afterEach(async () => {
        await databaseService.truncate('irec_beneficiary');
    });

    it('should create and return new IREC beneficiary', async () => {
        const { body: platformBeneficiaries } = await test
            .get('/irec/beneficiary')
            .set({ 'test-user': TestUser.OrganizationAdmin })
            .expect(HttpStatus.OK);

        const { body: companyBeneficiaries } = await test
            .get('/irec/beneficiary/company')
            .set({ 'test-user': TestUser.OrganizationAdmin })
            .expect(HttpStatus.OK);

        console.log(platformBeneficiaries);
        console.log(companyBeneficiaries);
    });
});
