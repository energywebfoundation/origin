/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-extraneous-dependencies */
import { HttpStatus, INestApplication } from '@nestjs/common';
import { DatabaseService } from '@energyweb/origin-backend-utils';

import { expect } from 'chai';
import supertest from 'supertest';
import { IRECAccountType, NewRegistrationDTO } from '../src';
import { bootstrapTestInstance, TestUser } from './test.app';
import { request } from './request';

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
        await test
            .post('/irec/registration')
            .send(registrationForm)
            .set({ 'test-user': TestUser.OrganizationAdmin })
            .expect(HttpStatus.CREATED);

        const { body: connection0 } = await test
            .get('/irec/connection')
            .set({ 'test-user': TestUser.OrganizationAdmin })
            .expect(HttpStatus.OK);
        expect(connection0).to.deep.equal({});

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

        expect(connection.accessToken).to.be.undefined;
        expect(connection.refreshToken).to.be.undefined;
        expect(connection.expiryDate).to.be.a('string');

        const { body: connection2 } = await test
            .get('/irec/connection')
            .set({ 'test-user': TestUser.OrganizationAdmin })
            .expect(HttpStatus.OK);

        expect(connection2.accessToken).to.be.undefined;
        expect(connection2.refreshToken).to.be.undefined;
        expect(String(connection2.expiryDate)).to.equal(String(connection.expiryDate));

        const { body: accounts }: { body: any[] } = await test
            .get('/irec/connection/accounts')
            .set({ 'test-user': TestUser.OrganizationAdmin })
            .expect(HttpStatus.OK);

        accounts.forEach((account) => {
            expect(account.code).to.be.a('string');
            expect(account.type).to.be.a('string');
            expect(account.details.name).to.be.a('string');
            expect(account.details.notes).to.be.a('string');
            expect(account.details.private).to.be.a('boolean');
            expect(account.details.restricted).to.be.a('boolean');
            expect(account.details.active).to.be.a('boolean');
        });
    });
});
