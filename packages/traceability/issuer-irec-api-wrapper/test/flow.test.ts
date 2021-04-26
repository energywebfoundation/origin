/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { validateOrReject } from 'class-validator';
import moment from 'moment/moment';
import fs from 'fs';

import { credentials, getClient } from './helpers';
import {
    Beneficiary,
    BeneficiaryCreateParams,
    Device,
    DeviceCreateParams,
    DeviceState,
    IRECAPIClient,
    Issue,
    IssueStatus,
    IssueWithStatus,
    Organisation
} from '../src';

describe('API flows', () => {
    let issuerClient: IRECAPIClient;
    let registrantClient: IRECAPIClient;
    let participantClient: IRECAPIClient;

    let issuerOrg: Organisation;
    let registrantOrg: Organisation;
    let participantOrg: Organisation;

    const tradeAccount = 'ACCOUNTTRADE001';
    const issueAccount = 'ACCOUNTISSUE001';

    function getDeviceParams(): DeviceCreateParams {
        return {
            address: '1 Wind Farm Avenue, London',
            capacity: 500,
            commissioningDate: new Date('2001-08-10'),
            countryCode: 'GB',
            defaultAccount: tradeAccount,
            deviceType: 'T020001',
            fuel: 'ES200',
            issuer: issuerOrg.code,
            latitude: '53.405088',
            longitude: '-1.744222',
            name: 'DeviceXYZ',
            notes: 'Lorem ipsum dolor sit amet',
            registrantOrganization: registrantOrg.code,
            registrationDate: new Date('2001-09-20'),
            active: true
        };
    }

    before(async () => {
        issuerClient = await getClient(credentials.issuer);
        registrantClient = await getClient(credentials.registrant);
        participantClient = await getClient(credentials.participant);

        issuerOrg = await issuerClient.organisation.get();
        registrantOrg = await registrantClient.organisation.get();
        participantOrg = await participantClient.organisation.get();
    });

    it('should pass create and approve device flow', async () => {
        const file = fs.createReadStream(`${__dirname}/file-sample_150kB.pdf`);
        const [fileId] = await registrantClient.file.upload([file]);

        const params = getDeviceParams();
        const createdDevice: Device = await registrantClient.device.create({
            ...params,
            files: [fileId]
        });

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

    it('should pass create and approve issue flow', async () => {
        const file = fs.createReadStream(`${__dirname}/file-sample_150kB.pdf`);
        const [fileId] = await registrantClient.file.upload([file]);

        const params = getDeviceParams();
        const device: Device = await registrantClient.device.create(params);
        const deviceCode: string = device.code;
        await registrantClient.device.submit(deviceCode, { notes: 'Some submit note' });
        await issuerClient.device.verify(deviceCode, { notes: 'Some verify note' });
        await issuerClient.device.approve(deviceCode, { notes: 'Some approve note' });

        const issueParams: Issue = {
            device: device.code,
            recipient: tradeAccount,
            start: moment().subtract(2, 'day').toDate(),
            end: moment().subtract(1, 'day').toDate(),
            production: 10,
            fuel: device.fuel,
            notes: 'Some note',
            files: [fileId]
        };
        const issueCode: string = await registrantClient.issue.create(issueParams);
        let issue: IssueWithStatus = await registrantClient.issue.get(issueCode);
        expect(issue.code).to.equal(issueCode);
        expect(issue.status).to.equal(IssueStatus.Draft);

        await registrantClient.issue.submit(issueCode);
        issue = await registrantClient.issue.get(issueCode);
        expect(issue.status).to.equal(IssueStatus.InProgress);
        let issuerIssue = await issuerClient.issue.get(issueCode);
        expect(issuerIssue.status).to.equal(IssueStatus.Submitted);

        await issuerClient.issue.verify(issueCode);
        issue = await registrantClient.issue.get(issueCode);
        expect(issue.status).to.equal(IssueStatus.InProgress);
        issuerIssue = await issuerClient.issue.get(issueCode);
        expect(issuerIssue.status).to.equal(IssueStatus.Verified);

        await issuerClient.issue.refer(issueCode);
        issue = await registrantClient.issue.get(issueCode);
        expect(issue.status).to.equal(IssueStatus.InProgress);
        issuerIssue = await issuerClient.issue.get(issueCode);
        expect(issuerIssue.status).to.equal(IssueStatus.Referred);

        await issuerClient.issue.reject(issueCode);
        issue = await registrantClient.issue.get(issueCode);
        expect(issue.status).to.equal(IssueStatus.Rejected);
        issuerIssue = await issuerClient.issue.get(issueCode);
        expect(issuerIssue.status).to.equal(IssueStatus.Rejected);

        await registrantClient.issue.submit(issueCode);
        await issuerClient.issue.verify(issueCode);
        await issuerClient.issue.approve(issueCode, {
            issuer: issueAccount,
            notes: 'it is ok'
        });
        issue = await registrantClient.issue.get(issueCode);
        expect(issue.status).to.equal(IssueStatus.Issued);
        issuerIssue = await issuerClient.issue.get(issueCode);
        expect(issuerIssue.status).to.equal(IssueStatus.Issued);
    }).timeout(10000);

    it('should create and update beneficiary', async () => {
        const beneficiaryParams: BeneficiaryCreateParams = {
            name: `My Test Beneficiary ${Date.now()}`,
            countryCode: 'GB',
            location: 'The Shire, Hobbiton',
            active: false
        };
        await participantClient.beneficiary.create(beneficiaryParams);
        const beneficiaries: Beneficiary[] = await participantClient.beneficiary.getAll();
        const newBeneficiary = beneficiaries.find((b) => b.name === beneficiaryParams.name);

        expect(newBeneficiary).to.be.not.equal(undefined);
        expect(newBeneficiary.id).to.be.a('number');
        expect(newBeneficiary.active).to.equal(false);

        let beneficiary = await participantClient.beneficiary.get(newBeneficiary.id);
        expect(beneficiary.name).to.equal(newBeneficiary.name);
        expect(beneficiary.location).to.equal(newBeneficiary.location);
        expect(beneficiary.active).to.equal(false);

        await participantClient.beneficiary.update(newBeneficiary.id, { active: true });
        beneficiary = await participantClient.beneficiary.get(newBeneficiary.id);
        expect(beneficiary.active).to.equal(true);
    }).timeout(10000);
});
