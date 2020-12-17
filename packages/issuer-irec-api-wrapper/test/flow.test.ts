/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import moment from 'moment';
import dotenv from 'dotenv';
import { validateOrReject } from 'class-validator';

import { IRECAPIClient } from '../src/IRECAPIClient';
import { Device, DeviceCreateUpdateParams, DeviceState } from '../src/Device';
import { Issue, IssueStatus, IssueWithStatus } from '../src/Issue';

dotenv.config();

describe('API flows', () => {
    let client: IRECAPIClient;

    const tradeAccount = 'ACCOUNTTRADE001';
    const issueAccount = 'ACCOUNTISSUE001';

    before(async () => {
        client = new IRECAPIClient(process.env.IREC_API_URL);
        await client.login(
            process.env.IREC_API_LOGIN,
            process.env.IREC_API_PASSWORD,
            process.env.IREC_API_CLIENT_ID,
            process.env.IREC_API_CLIENT_SECRET
        );
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
            issuer: 'ORGANISATION006',
            latitude: 53.405088,
            longitude: -1.744222,
            name: 'DeviceXYZ',
            notes: 'Lorem ipsum dolor sit amet',
            registrantOrganization: 'ORGANISATION001',
            registrationDate: new Date('2001-09-20')
        };
        const createdDevice: Device = await client.device.create(params);

        let device: Device = await client.device.get(createdDevice.code);
        const deviceCode: string = device.code;
        expect(device.code).to.equal(deviceCode);
        expect(device.name).to.equal(params.name);
        expect(Number(device.capacity)).to.equal(Number(params.capacity));
        expect(device.status).to.equal(DeviceState.Draft);

        await validateOrReject(device);
        await client.device.submit(deviceCode, { notes: 'Some submit note' });
        device = await client.device.get(deviceCode);
        expect(device.status).to.equal(DeviceState.InProgress);

        await client.device.verify(deviceCode, { notes: 'Some verify note' });
        device = await client.device.get(deviceCode);
        expect(device.status).to.equal(DeviceState.InProgress);

        await client.device.refer(deviceCode, { notes: 'Some refer note' });
        device = await client.device.get(deviceCode);
        expect(device.status).to.equal(DeviceState.InProgress);

        await client.device.reject(deviceCode, { notes: 'Some reject note' });
        device = await client.device.get(deviceCode);
        expect(device.status).to.equal(DeviceState.Rejected);

        await client.device.submit(deviceCode, { notes: 'Some submit note 2' });
        await client.device.verify(deviceCode, { notes: 'Some verify note 2' });
        await client.device.approve(deviceCode, { notes: 'Some approve note' });
        device = await client.device.get(deviceCode);
        expect(device.status).to.equal(DeviceState.Approved);

        await client.device.edit(deviceCode, { capacity: 1000, name: 'DeviceZZZ' });
        device = await client.device.get(deviceCode);
        expect(device.capacity).to.equal(1000);
        expect(device.name).to.equal('DeviceZZZ');
        expect(device.status).to.equal(DeviceState.Draft);
    }).timeout(10000);

    it('should pass create and approve issue flow', async () => {
        const devices: Device[] = await client.device.getAll();
        const approvedDevice = devices.find((device) => device.status === DeviceState.Approved);
        const issueParams: Issue = {
            device: approvedDevice.code,
            recipient: tradeAccount,
            start: moment().add(1, 'day').toDate(),
            end: moment().add(2, 'day').toDate(),
            production: 10,
            fuel: approvedDevice.fuel,
            notes: 'Some note'
        };

        const issueCode: string = await client.issue.create(issueParams);

        let issue: IssueWithStatus = await client.issue.get(issueCode);
        expect(issue.code).to.equal(issueCode);
        expect(issue.status).to.equal(IssueStatus.Draft);

        await client.issue.submit(issueCode);
        issue = await client.issue.get(issueCode);
        expect(issue.status).to.equal(IssueStatus.Submitted);

        await client.issue.verify(issueCode);
        issue = await client.issue.get(issueCode);
        expect(issue.status).to.equal(IssueStatus.Verified);

        await client.issue.refer(issueCode);
        issue = await client.issue.get(issueCode);
        expect(issue.status).to.equal(IssueStatus.Referred);

        await client.issue.reject(issueCode);
        issue = await client.issue.get(issueCode);
        expect(issue.status).to.equal(IssueStatus.Rejected);

        await client.issue.submit(issueCode);
        await client.issue.verify(issueCode);
        await client.issue.approve(issueCode, { issuer: issueAccount, notes: 'it is ok' });
        issue = await client.issue.get(issueCode);
        expect(issue.status).to.equal(IssueStatus.Approved);
    }).timeout(10000);
});
