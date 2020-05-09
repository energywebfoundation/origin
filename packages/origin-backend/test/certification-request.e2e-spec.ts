/* eslint-disable no-return-assign */
import { DeviceStatus, Role, ICertificationRequestBackend } from '@energyweb/origin-backend-core';
import request from 'supertest';
import moment from 'moment';

import { registerAndLogin, bootstrapTestInstance } from './origin-backend';

describe('CertificationRequest e2e tests', () => {
    it('should read information from the blockchain', async () => {
        const {
            app,
            userService,
            deviceService,
            organizationService,
            configurationService,
            certificationRequestService
        } = await bootstrapTestInstance();

        await app.init();

        const { accessToken, user } = await registerAndLogin(
            app,
            configurationService,
            userService,
            organizationService,
            [Role.OrganizationUser, Role.OrganizationDeviceManager]
        );

        await request(app.getHttpServer())
            .get(`/Certificate/CertificationRequest`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect((res) => {
                const requests = res.body as ICertificationRequestBackend[];

                expect(requests).toHaveLength(0);
            });

        const device = await deviceService.create(
            {
                address: '',
                capacityInW: 1000,
                complianceRegistry: 'I-REC',
                country: 'EU',
                description: '',
                deviceType: 'Solar',
                facilityName: 'Test',
                gpsLatitude: '10',
                gpsLongitude: '10',
                gridOperator: 'OP',
                images: '',
                operationalSince: 2000,
                otherGreenAttributes: '',
                province: '',
                region: '',
                status: DeviceStatus.Active,
                timezone: '',
                typeOfPublicSupport: '',
                deviceGroup: '',
                smartMeterReads: [],
                externalDeviceIds: [],
                automaticPostForSale: false,
                defaultAskPrice: null
            },
            user
        );

        const owner = '0xD173313A51f8fc37BcF67569b463abd89d81844f';
        const fromTime = moment().subtract(2, 'month').unix();
        const toTime = moment().subtract(1, 'month').unix();
        const created = moment().subtract(1, 'day').unix();

        let certificationRequest = await certificationRequestService.create({
            id: 1,
            owner,
            fromTime,
            toTime,
            device,
            approved: false,
            revoked: false,
            created
        });

        await request(app.getHttpServer())
            .get(`/Certificate/CertificationRequest/${certificationRequest.id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect((res) => {
                const cr = res.body as ICertificationRequestBackend;

                expect(cr.owner).toBe(owner);
                expect(cr.fromTime).toBe(fromTime);
                expect(cr.toTime).toBe(toTime);
                expect(cr.approved).toBe(false);
                expect(cr.revoked).toBe(false);
                expect(cr.created).toBe(created);
            });

        const energy = '100000';
        const files = ['./test.pdf', './test2.pdf'];

        certificationRequest = await certificationRequestService.update(
            certificationRequest.id,
            { energy, files },
            user
        );

        await request(app.getHttpServer())
            .get(`/Certificate/CertificationRequest/${certificationRequest.id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect((res) => {
                const cr = res.body as ICertificationRequestBackend;

                expect(cr.energy).toBe(energy);
                expect(cr.files).toStrictEqual(files);
            });

        await request(app.getHttpServer())
            .get(`/Certificate/CertificationRequest`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect((res) => {
                const requests = res.body as ICertificationRequestBackend[];

                expect(requests).toHaveLength(1);
            });

        await app.close();
    });
});
