/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-extraneous-dependencies */
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import supertest from 'supertest';

import { ConnectDTO } from '../src/connect/connect.dto';
import { Connect } from '../src/connect/connect.entity';
import { ConnectService } from '../src/connect/connect.service';
import { request } from './request';
import { bootstrapTestInstance, TestUser, testUsers } from './test.app';

describe('I-REC Connect tests', () => {
    let app: INestApplication;
    let databaseService: DatabaseService;
    let connectService: ConnectService;
    let test: supertest.SuperTest<supertest.Test>;

    const connectForm = {
        code: 'ORG_CODE_1',
        leadUserFullName: 'John Doe',
        leadUserEmail: 'john@example.com'
    } as ConnectDTO;

    before(async () => {
        ({ app, databaseService, connectService } = await bootstrapTestInstance());

        await app.init();

        test = request(app);
    });

    after(async () => {
        await databaseService.cleanUp();
        await app.close();
    });

    afterEach(async () => {
        await databaseService.truncate('irec_connect');
    });

    it('should allow to sent new registration form', async () => {
        await test
            .post('/irec/connect')
            .set({ 'test-user': TestUser.OrganizationAdmin })
            .send(connectForm)
            .expect(201)
            .expect((res) => {
                const { id } = res.body as { id: string };

                expect(id).to.be.not.undefined;
            });
    });

    it('should not allow user from outside the organization to read registrations', async () => {
        const admin1 = testUsers.get(TestUser.OrganizationAdmin);
        const admin2 = testUsers.get(TestUser.OtherOrganizationAdmin);

        const regId1 = await connectService.register(admin1.organization.id, connectForm);
        const regId2 = await connectService.register(admin2.organization.id, connectForm);

        await test
            .get('/irec/connect')
            .set({ 'test-user': TestUser.OrganizationAdmin })
            .expect(200)
            .expect((res) => {
                const registrations = res.body as Connect[];
                expect(registrations).to.have.length(1);
                expect(registrations[0].id).to.be.equal(regId1);
            });

        await test
            .get('/irec/connect')
            .set({ 'test-user': TestUser.OtherOrganizationAdmin })
            .expect(200)
            .expect((res) => {
                const registrations = res.body as Connect[];
                expect(registrations).to.have.length(1);
                expect(registrations[0].id).to.be.equal(regId2);
            });

        await test
            .get('/irec/connect')
            .set({ 'test-user': TestUser.PlatformAdmin })
            .expect(200)
            .expect((res) => {
                const registrations = res.body as Connect[];
                expect(registrations).to.have.length(2);
            });
    });
});
