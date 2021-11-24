import request from 'supertest';
import { expect } from 'chai';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestUser } from '@energyweb/issuer-irec-api/dist/js/test/issuer-irec-api';
import { CERTIFICATES_TABLE_NAME } from '@energyweb/issuer-irec-api';
import { DatabaseService } from '@energyweb/origin-backend-utils';

import { bootstrapTestInstance } from './exchange';

describe('import tests', () => {
    let app: INestApplication;
    let databaseService: DatabaseService;

    before(async () => {
        ({ databaseService, app } = await bootstrapTestInstance());

        await app.init();
    });

    afterEach(async () => {
        await databaseService.truncate(CERTIFICATES_TABLE_NAME);
    });

    after(async () => {
        await databaseService.truncate(CERTIFICATES_TABLE_NAME);
        await databaseService.cleanUp();
        await app.close();
    });

    it('should import certificate', async () => {
        const {
            body: [certificateToImport]
        } = await request(app.getHttpServer())
            .get(`/irec/import`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .expect(HttpStatus.OK);

        expect(certificateToImport.asset).to.equal('test-asset-id');
        expect(certificateToImport.isDeviceImported).to.equal(true);

        await request(app.getHttpServer())
            .post(`/irec/import`)
            .send({ assetId: certificateToImport.asset })
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .expect(HttpStatus.CREATED);
    });
});
