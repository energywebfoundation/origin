/* eslint-disable no-unused-expressions */
/* eslint-disable no-return-assign */
import { DeviceStatus, ICertificationRequestBackend, Role } from '@energyweb/origin-backend-core';
import { INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import moment from 'moment';
import request from 'supertest';

import { CertificationRequestService } from '../src/pods/certificate/certification-request.service';
import { DeviceService } from '../src/pods/device/device.service';
import { OrganizationService } from '../src/pods/organization/organization.service';
import { UserService } from '../src/pods/user';
import { bootstrapTestInstance, registerAndLogin } from './origin-backend';

describe('CertificationRequest e2e tests', () => {
    let app: INestApplication;
    let userService: UserService;
    let deviceService: DeviceService;
    let organizationService: OrganizationService;
    let certificationRequestService: CertificationRequestService;

    const defaultOrganization = 'org1';

    before(async () => {
        ({
            app,
            userService,
            deviceService,
            organizationService,
            certificationRequestService
        } = await bootstrapTestInstance());

        await app.init();
    });

    after(async () => {
        await app.close();
    });

    it('should read information from the blockchain', async () => {
        const { accessToken, user } = await registerAndLogin(
            app,
            userService,
            organizationService,
            [Role.OrganizationUser, Role.OrganizationDeviceManager],
            '1',
            defaultOrganization
        );

        await request(app.getHttpServer())
            .get(`/Certificate/CertificationRequest`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect((res) => {
                const requests = res.body as ICertificationRequestBackend[];

                expect(requests).to.have.length(0);
            });

        const externalDeviceId = '123';

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
                externalDeviceIds: [{ id: externalDeviceId, type: process.env.ISSUER_ID }],
                automaticPostForSale: false,
                defaultAskPrice: null
            },
            user
        );

        const owner = '0xD173313A51f8fc37BcF67569b463abd89d81844f';
        const fromTime = moment().subtract(2, 'month').unix();
        const toTime = moment().subtract(1, 'month').unix();
        const created = moment().subtract(1, 'day').unix();

        const energy = '100000';
        const files = ['./test.pdf', './test2.pdf'];

        await certificationRequestService.queue(
            { deviceId: externalDeviceId, fromTime, toTime, energy, files },
            user
        );

        const certificationRequest = await certificationRequestService.create({
            id: 1,
            owner,
            fromTime,
            toTime,
            device,
            approved: false,
            revoked: false,
            created,
            userId: user.ownerId
        });

        await request(app.getHttpServer())
            .get(`/Certificate/CertificationRequest/${certificationRequest.id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect((res) => {
                const cr = res.body as ICertificationRequestBackend;

                expect(cr.owner).equals(owner);
                expect(cr.fromTime).equals(fromTime);
                expect(cr.toTime).equals(toTime);
                expect(cr.approved).equals(false);
                expect(cr.revoked).equals(false);
                expect(cr.created).equals(created);
                expect(cr.energy).equals(energy);
                expect(cr.files).deep.equals(files);
            });

        await request(app.getHttpServer())
            .get(`/Certificate/CertificationRequest`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect((res) => {
                const requests = res.body as ICertificationRequestBackend[];

                expect(requests).to.have.length(1);
            });
    });

    it('should not be able to create a certification request for a non-approved device', async () => {
        const { user } = await registerAndLogin(
            app,
            userService,
            organizationService,
            [Role.OrganizationUser, Role.OrganizationDeviceManager],
            '1',
            defaultOrganization
        );

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
                status: DeviceStatus.Submitted,
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

        try {
            await certificationRequestService.create({
                id: 1,
                owner,
                fromTime,
                toTime,
                device,
                approved: false,
                revoked: false,
                created,
                userId: user.ownerId
            });
        } catch (e) {
            expect(e).to.be.ok;
            return;
        }

        expect.fail();
    });

    it('should allow issuer to read the certification request', async () => {
        const { accessToken } = await registerAndLogin(
            app,
            userService,
            organizationService,
            [Role.Issuer],
            'issuer',
            'issuerOrg'
        );

        await request(app.getHttpServer())
            .get(`/Certificate/CertificationRequest`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect((res) => {
                const requests = res.body as ICertificationRequestBackend[];

                expect(requests).to.have.length(1);
            });
    });

    it('should allow other organization member to read the certification request', async () => {
        const { accessToken } = await registerAndLogin(
            app,
            userService,
            organizationService,
            [Role.OrganizationDeviceManager],
            '2',
            defaultOrganization
        );

        await request(app.getHttpServer())
            .get(`/Certificate/CertificationRequest`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect((res) => {
                const requests = res.body as ICertificationRequestBackend[];

                expect(requests).to.have.length(1);
            });
    });
});
