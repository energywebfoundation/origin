/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-extraneous-dependencies */
import { HttpStatus, INestApplication } from '@nestjs/common';
import { DatabaseService } from '@energyweb/origin-backend-utils';

import { expect } from 'chai';
import supertest from 'supertest';
import { bootstrapTestInstance, TestUser } from './test.app';
import { IRECAccountType } from '../src/registration/account-type.enum';
import { request } from './request';
import { NewRegistrationDTO } from '../src/registration/new-registration.dto';

describe('I-REC Registration tests', () => {
    let app: INestApplication;
    let databaseService: DatabaseService;
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
        ({ app, databaseService } = await bootstrapTestInstance());

        await app.init();

        test = request(app);
    });

    after(async () => {
        await databaseService.cleanUp();
        await app.close();
    });

    afterEach(async () => {
        await databaseService.truncate('irec_registration');
        await databaseService.truncate('irec_connection');
    });

    it('should create and return new IREC connection', async () => {
        const { body: registration } = await test
            .post('/irec/registration')
            .send(registrationForm)
            .set({ 'test-user': TestUser.OrganizationAdmin })
            .expect(HttpStatus.CREATED);

        const { body: connection } = await test
            .post('/irec/connection')
            .send({
                userName: 'test',
                password: 'test',
                clientId: 'test',
                clientSecret: 'test'
            })
            .set({ 'test-user': TestUser.OrganizationAdmin })
            .expect(HttpStatus.CREATED);

        expect(connection.registration.id).to.equal(registration.id);
        expect(connection.accessToken).to.be.a('string');
        expect(connection.refreshToken).to.be.a('string');
        expect(connection.expiryDate).to.be.a('string');
        const { body: connection2 } = await test
            .get('/irec/connection')
            .set({ 'test-user': TestUser.OrganizationAdmin })
            .expect(HttpStatus.OK);

        expect(connection.accessToken).to.equal(connection2.accessToken);
        expect(connection.refreshToken).to.equal(connection2.refreshToken);
        expect(String(connection.expiryDate)).to.equal(String(connection2.expiryDate));
        expect(connection.registration.id).to.equal(connection2.registration.id);
        expect(connection.active).to.equal(true);
    });
});
