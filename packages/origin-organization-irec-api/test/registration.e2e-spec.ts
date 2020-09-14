/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-extraneous-dependencies */
import { INestApplication } from '@nestjs/common';
import { DatabaseService } from '@energyweb/origin-backend-utils';

import { expect } from 'chai';
import supertest from 'supertest';

import { RegistrationDTO } from '../src/registration/registration.dto';
import { bootstrapTestInstance, TestUser, testUsers } from './test.app';
import { Registration } from '../src/registration/registration.entity';
import { RegistrationService } from '../src/registration/registration.service';
import { IRECAccountType } from '../src/registration/account-type.enum';
import { request } from './request';

describe('I-REC Registration tests', () => {
    let app: INestApplication;
    let databaseService: DatabaseService;
    let registrationService: RegistrationService;
    let test: supertest.SuperTest<supertest.Test>;

    const registrationForm = {
        accountType: IRECAccountType.Registrant,
        activeCountries: ['PL', 'GB'],
        employeesNumber: '1-50',
        headquarterCountry: 'GB',
        registrationYear: 2000,
        shareholders: 'John, Mike',
        website: 'https://example.com',
        ceoName: 'John Doe',
        ceoPassportNumber: '12345',
        balanceSheetTotal: '$1,000,000',
        mainBusiness: 'Solar Farm'
    } as RegistrationDTO;

    before(async () => {
        ({ app, databaseService, registrationService } = await bootstrapTestInstance());

        await app.init();

        test = request(app);
    });

    after(async () => {
        await databaseService.cleanUp();
        await app.close();
    });

    afterEach(async () => {
        await databaseService.truncate('irec_registration');
    });

    it('should allow to sent new registration form', async () => {
        await test
            .post('/irec/registration')
            .set({ 'test-user': TestUser.OrganizationAdmin })
            .send(registrationForm)
            .expect(201)
            .expect((res) => {
                const { id } = res.body as { id: string };

                expect(id).to.be.not.undefined;
            });
    });

    it('should not allow user from outside the organization to read registrations', async () => {
        const admin1 = testUsers.get(TestUser.OrganizationAdmin);
        const admin2 = testUsers.get(TestUser.OtherOrganizationAdmin);

        const regId1 = await registrationService.register(admin1.organization.id, registrationForm);
        const regId2 = await registrationService.register(admin2.organization.id, registrationForm);

        await test
            .get('/irec/registration')
            .set({ 'test-user': TestUser.OrganizationAdmin })
            .expect(200)
            .expect((res) => {
                const registrations = res.body as Registration[];
                expect(registrations).to.have.length(1);
                expect(registrations[0].id).to.be.equal(regId1);
            });

        await test
            .get('/irec/registration')
            .set({ 'test-user': TestUser.OtherOrganizationAdmin })
            .expect(200)
            .expect((res) => {
                const registrations = res.body as Registration[];
                expect(registrations).to.have.length(1);
                expect(registrations[0].id).to.be.equal(regId2);
            });

        await test
            .get('/irec/registration')
            .set({ 'test-user': TestUser.PlatformAdmin })
            .expect(200)
            .expect((res) => {
                const registrations = res.body as Registration[];
                expect(registrations).to.have.length(2);
            });
    });
});
