/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-extraneous-dependencies */
import { HttpStatus, INestApplication } from '@nestjs/common';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import supertest from 'supertest';
import { expect } from 'chai';
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
                ("id", "irecBeneficiaryId", "organizationId", "ownerOrganizationId")
            VALUES 
                (1, 555, 1000,  1002);
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

        expect(platformBeneficiaries).to.have.length(1);
        expect(platformBeneficiaries[0].organization.id).to.equal(1000);
        expect(platformBeneficiaries[0].ownerOrganizationId).to.equal(1002);

        const { body: companyBeneficiaries } = await test
            .get('/irec/beneficiary/company')
            .set({ 'test-user': TestUser.OrganizationAdmin })
            .expect(HttpStatus.OK);

        expect(companyBeneficiaries).to.deep.equal([]);

        const { body: companyBeneficiary } = await test
            .post('/irec/beneficiary')
            .send({ irecBeneficiaryId: platformBeneficiaries[0].irecBeneficiaryId })
            .set({ 'test-user': TestUser.OrganizationAdmin })
            .expect(HttpStatus.CREATED);

        const { body: companyBeneficiaries2 } = await test
            .get('/irec/beneficiary/company')
            .set({ 'test-user': TestUser.OrganizationAdmin })
            .expect(HttpStatus.OK);

        expect(companyBeneficiaries2).to.have.length(1);
        expect(companyBeneficiaries2[0]).to.deep.equal(companyBeneficiary);

        await test
            .delete(`/irec/beneficiary/${companyBeneficiary.id}`)
            .set({ 'test-user': TestUser.OrganizationAdmin })
            .expect(HttpStatus.OK);

        const { body: companyBeneficiaries3 } = await test
            .get('/irec/beneficiary/company')
            .set({ 'test-user': TestUser.OrganizationAdmin })
            .expect(HttpStatus.OK);

        expect(companyBeneficiaries3).to.have.length(0);
    });
});
