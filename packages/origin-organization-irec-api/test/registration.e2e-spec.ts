/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-extraneous-dependencies */
import { HttpStatus, INestApplication } from '@nestjs/common';
import { DatabaseService } from '@energyweb/origin-backend-utils';

import { expect } from 'chai';
import supertest from 'supertest';

import { LoggedInUser } from '@energyweb/origin-backend-core';
import { bootstrapTestInstance, TestUser, testUsers } from './test.app';
import { Registration } from '../src/registration/registration.entity';
import { RegistrationService } from '../src/registration/registration.service';
import { IRECAccountType } from '../src/registration/account-type.enum';
import { request } from './request';
import { NewRegistrationDTO } from '../src/registration/new-registration.dto';

describe('I-REC Registration tests', () => {
    let app: INestApplication;
    let databaseService: DatabaseService;
    let registrationService: RegistrationService;
    let test: supertest.SuperTest<supertest.Test>;

    const registrationForm: NewRegistrationDTO = {
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
        mainBusiness: 'Solar Farm',
        primaryContactOrganizationName: 'Z ltd',
        primaryContactOrganizationAddress: 'London',
        primaryContactOrganizationPostalCode: '6300',
        primaryContactOrganizationCountry: 'GB',
        primaryContactName: 'Z',
        primaryContactEmail: 'z@exmple.com',
        primaryContactPhoneNumber: '123-123',
        primaryContactFax: '-',
        leadUserTitle: 'Mr.',
        leadUserFirstName: 'Z',
        leadUserLastName: 'Z',
        leadUserEmail: 'z@example.com',
        leadUserPhoneNumber: '123-123',
        leadUserFax: '-'
    };

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
            .expect(HttpStatus.CREATED)
            .expect((res) => {
                const { id } = res.body as { id: string };

                expect(id).to.be.not.undefined;
            });
    });

    it('should not allow user from outside the organization to read registrations', async () => {
        const admin1 = testUsers.get(TestUser.OrganizationAdmin);
        const admin2 = testUsers.get(TestUser.OtherOrganizationAdmin);

        const regId1 = await registrationService.register(
            new LoggedInUser(admin1),
            registrationForm
        );
        const regId2 = await registrationService.register(
            new LoggedInUser(admin2),
            registrationForm
        );

        await test
            .get('/irec/registration')
            .set({ 'test-user': TestUser.OrganizationAdmin })
            .expect(HttpStatus.OK)
            .expect((res) => {
                const registrations = res.body as Registration[];
                expect(registrations).to.have.length(1);
                expect(registrations[0].id).to.be.equal(regId1);
            });

        await test
            .get('/irec/registration')
            .set({ 'test-user': TestUser.OtherOrganizationAdmin })
            .expect(HttpStatus.OK)
            .expect((res) => {
                const registrations = res.body as Registration[];
                expect(registrations).to.have.length(1);
                expect(registrations[0].id).to.be.equal(regId2);
            });

        await test
            .get('/irec/registration')
            .set({ 'test-user': TestUser.PlatformAdmin })
            .expect(HttpStatus.OK)
            .expect((res) => {
                const registrations = res.body as Registration[];
                expect(registrations).to.have.length(2);
            });
    });
});
