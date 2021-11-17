import { DatabaseService } from '@energyweb/origin-backend-utils';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootstrapTestInstance } from './exchange';
import { expect } from 'chai';
import { TestUser } from '@energyweb/issuer-irec-api/dist/js/test/issuer-irec-api';
import { CertificateDTO, CERTIFICATES_TABLE_NAME } from '@energyweb/issuer-irec-api';

describe('import tests', () => {
    let app: INestApplication;
    let databaseService: DatabaseService;
    const getCertificates = async (user: TestUser): Promise<CertificateDTO[]> => {
        const { body } = await request(app.getHttpServer())
            .get(`/irec/certificate`)
            .set({ 'test-user': user })
            .expect(HttpStatus.OK);

        return body;
    };

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
        let certificates = await getCertificates(TestUser.OrganizationDeviceManager);
        expect(certificates.length).to.equal(0);

        const {
            body: [certificateToImport]
        } = await request(app.getHttpServer())
            .get(`/irec/certificate/importable`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .expect(HttpStatus.OK);

        expect(certificateToImport.asset).to.equal('test-asset-id');
        expect(certificateToImport.isDeviceImported).to.equal(true);

        await request(app.getHttpServer())
            .post(`/irec/certificate/import`)
            .send({ assetId: certificateToImport.asset })
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .expect(HttpStatus.CREATED);
    });
});
