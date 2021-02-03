/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import dotenv from 'dotenv';
import { validateOrReject } from 'class-validator';
import moment from 'moment/moment';

import { IRECAPIClient } from '../src/IRECAPIClient';
import { Device, DeviceCreateUpdateParams, DeviceState } from '../src/Device';
import { credentials, getClient } from './helpers';
import { Organisation } from '../src/Organisation';
import { Issue, IssueStatus, IssueWithStatus } from '../src/Issue';

dotenv.config();

describe('API flows', () => {
    let issuerClient: IRECAPIClient;
    let participantClient: IRECAPIClient;
    let registrantClient: IRECAPIClient;

    let issuerOrg: Organisation;
    let participantOrg: Organisation;
    let registrantOrg: Organisation;

    const tradeAccount = 'ACCOUNTTRADE001';
    const issueAccount = 'ACCOUNTISSUE001';

    before(async () => {
        issuerClient = await getClient(credentials.issuer);
        participantClient = await getClient(credentials.participant);
        registrantClient = await getClient(credentials.registrant);

        issuerOrg = await issuerClient.organisation.get();
        participantOrg = await participantClient.organisation.get();
        registrantOrg = await registrantClient.organisation.get();

        console.log('issuerOrg', issuerOrg);
        console.log('participantOrg', participantOrg);
        console.log('registrantOrg', registrantOrg);
    });

    it('should pass create and approve device flow', async () => {
        const params: DeviceCreateUpdateParams = {
            address: '1 Wind Farm Avenue, London',
            capacity: 500,
            commissioningDate: new Date('2001-08-10'),
            countryCode: 'GB',
            defaultAccount: tradeAccount,
            deviceType: 'T020001',
            fuel: 'ES200',
            issuer: issuerOrg.code,
            latitude: 53.405088,
            longitude: -1.744222,
            name: 'DeviceXYZ',
            notes: 'Lorem ipsum dolor sit amet',
            registrantOrganization: registrantOrg.code,
            registrationDate: new Date('2001-09-20')
        };
        const createdDevice: Device = await registrantClient.device.create(params);

        let device: Device = await registrantClient.device.get(createdDevice.code);
        const deviceCode: string = device.code;
        expect(device.code).to.equal(deviceCode);
        expect(device.name).to.equal(params.name);
        expect(Number(device.capacity)).to.equal(Number(params.capacity));
        expect(device.status).to.equal(DeviceState.Draft);

        await validateOrReject(device);
        await registrantClient.device.submit(deviceCode, { notes: 'Some submit note' });
        device = await registrantClient.device.get(deviceCode);
        expect(device.status).to.equal(DeviceState.InProgress);

        await issuerClient.device.verify(deviceCode, { notes: 'Some verify note' });
        device = await registrantClient.device.get(deviceCode);
        expect(device.status).to.equal(DeviceState.InProgress);

        await issuerClient.device.refer(deviceCode, { notes: 'Some refer note' });
        device = await registrantClient.device.get(deviceCode);
        expect(device.status).to.equal(DeviceState.InProgress);

        await issuerClient.device.reject(deviceCode, { notes: 'Some reject note' });
        device = await registrantClient.device.get(deviceCode);
        expect(device.status).to.equal(DeviceState.Rejected);

        await registrantClient.device.submit(deviceCode, { notes: 'Some submit note 2' });
        await issuerClient.device.verify(deviceCode, { notes: 'Some verify note 2' });
        await issuerClient.device.approve(deviceCode, { notes: 'Some approve note' });
        device = await registrantClient.device.get(deviceCode);
        expect(device.status).to.equal(DeviceState.Approved);

        await registrantClient.device.edit(deviceCode, { capacity: 1000, name: 'DeviceZZZ' });
        device = await registrantClient.device.get(deviceCode);
        expect(device.capacity).to.equal(1000);
        expect(device.name).to.equal('DeviceZZZ');
        expect(device.status).to.equal(DeviceState.Draft);
    }).timeout(10000);

    it.only('should pass create and approve issue flow', async () => {
        const devices: Device[] = await registrantClient.device.getAll();
        const approvedDevice = devices.find((device) => device.status === DeviceState.Approved);

        const issueParams: Issue = {
            device: approvedDevice.code,
            recipient: tradeAccount,
            start: moment().subtract(2, 'day').toDate(),
            end: moment().subtract(1, 'day').toDate(),
            production: 10,
            fuel: approvedDevice.fuel,
            notes: 'Some note'
        };
        const issueCode: string = await registrantClient.issue.create(issueParams);

        let issue: IssueWithStatus = await registrantClient.issue.get(issueCode);
        expect(issue.code).to.equal(issueCode);
        expect(issue.status).to.equal(IssueStatus.Draft);

        await registrantClient.issue.submit(issueCode);
        issue = await registrantClient.issue.get(issueCode);
        expect(issue.status).to.equal(IssueStatus.Submitted);

        await registrantClient.issue.verify(issueCode);
        issue = await registrantClient.issue.get(issueCode);
        expect(issue.status).to.equal(IssueStatus.Verified);

        await registrantClient.issue.refer(issueCode);
        issue = await registrantClient.issue.get(issueCode);
        expect(issue.status).to.equal(IssueStatus.Referred);

        await registrantClient.issue.reject(issueCode);
        issue = await registrantClient.issue.get(issueCode);
        expect(issue.status).to.equal(IssueStatus.Rejected);

        await registrantClient.issue.submit(issueCode);
        await registrantClient.issue.verify(issueCode);
        await registrantClient.issue.approve(issueCode, {
            issuer: issueAccount,
            notes: 'it is ok'
        });
        issue = await registrantClient.issue.get(issueCode);
        expect(issue.status).to.equal(IssueStatus.Approved);
    }).timeout(10000);
});
