/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import fs from 'fs';
import moment from 'moment-timezone';

import {
    ApproveIssue,
    DeviceType,
    FuelType,
    IRECAPIClient,
    Product,
    Redemption,
    ReservationItem
} from '../src';

import { credentials, getClient, validateCodeName, validateOrganization } from './helpers';

describe('IREC API', () => {
    let participantClient: IRECAPIClient;
    let issuerClient: IRECAPIClient;
    let registrantClient: IRECAPIClient;

    const tradeAccount = 'ACCOUNTTRADE001';
    const issueAccount = 'ACCOUNTISSUE001';
    const redemptionAccount = 'ACCOUNTREDEMPTION001';

    before(async () => {
        participantClient = await getClient(credentials.participant);
        issuerClient = await getClient(credentials.issuer);
        registrantClient = await getClient(credentials.registrant);
    });

    describe('Account', () => {
        it(`should fetch all accounts`, async () => {
            const [firstAccount] = await participantClient.account.getAll();

            expect(firstAccount.details).to.exist;
            expect(firstAccount.type).to.exist;
        });

        it('should fetch account by code', async () => {
            const [firstAccount] = await participantClient.account.getAll();
            const account = await participantClient.account.get(firstAccount.code);

            expect(account.code).to.equal(firstAccount.code);
            expect(account.details).to.exist;
            expect(account.details.name).to.exist;
            expect(account.details.active).to.be.equal(true);
            expect(account.type).to.exist;
        });

        it('should fetch balance by code', async () => {
            const [firstAccount] = await participantClient.account.getAll();
            const [accountBalance] = await participantClient.account.getBalance(firstAccount.code);

            expect(accountBalance.code).to.equal(firstAccount.code);
            expect(accountBalance.product).to.be.instanceOf(Product);
        });

        it('should fetch items by code', async () => {
            const [accountItem] = await participantClient.account.getItems(tradeAccount);

            expect(accountItem).to.exist;
            expect(accountItem.items).to.exist;
            expect(accountItem.code).to.be.equal(tradeAccount);

            const [item] = accountItem.items;

            expect(item.code).to.exist;
            expect(item.asset).to.exist;

            expect(item.asset.start).to.be.an.instanceOf(Date);
            expect(item.asset.end).to.be.an.instanceOf(Date);
        });

        it('should fetch transactions', async () => {
            const transactions = await participantClient.account.getTransactions(tradeAccount);

            expect(transactions).to.exist;
        });
    });

    it('should be able to request certificate', async () => {
        const [accountItem] = await participantClient.account.getItems(tradeAccount);

        const [lastItem] = accountItem.items.sort(
            (a, b) => b.asset.end.getTime() - a.asset.end.getTime()
        );

        const beforeTransactions = await participantClient.account.getTransactions(tradeAccount);

        const createdIssue = await registrantClient.issue.create({
            device: 'DEVICE001',
            recipient: tradeAccount,
            start: moment(lastItem.asset.end).add(1, 'day').toDate(),
            end: moment(lastItem.asset.end).add(2, 'day').toDate(),
            production: 100,
            deviceType: 'ES200'
        });

        await participantClient.issue.submit(createdIssue.code, 'Note');
        await participantClient.issue.verify(createdIssue.code, 'Note');

        const approval = new ApproveIssue();
        approval.issuer = issueAccount;

        await participantClient.issue.approve(createdIssue.code, approval);

        const afterTransactions = await registrantClient.account.getTransactions(tradeAccount);

        expect(afterTransactions).to.has.lengthOf(beforeTransactions.length + 1);
    });

    it('should be able to redeem the certificate', async () => {
        const [account] = await participantClient.account.getItems(tradeAccount);
        const [newestItem] = account.items;

        const reservationItem = new ReservationItem();
        reservationItem.code = newestItem.code;
        reservationItem.amount = 1;

        const redemption = new Redemption();
        redemption.items = [reservationItem];
        redemption.beneficiary = 1;
        redemption.start = new Date('2020-01-01');
        redemption.end = new Date('2020-02-01');
        redemption.purpose = 'Purpose';
        redemption.sender = tradeAccount;
        redemption.recipient = redemptionAccount;
        redemption.approver = process.env.IREC_API_LOGIN;

        await participantClient.redeem(redemption);
    });

    it('should be able to upload pdf evidence file', async () => {
        const file = fs.createReadStream(`${__dirname}/file-sample_150kB.pdf`);

        const [fileId] = await registrantClient.file.upload([file]);

        expect(fileId).to.exist;

        const url = await registrantClient.file.download(fileId);

        expect(url).to.exist;
    });

    describe('Organization', () => {
        it('should return own organization info', async () => {
            const org = await registrantClient.organisation.get();
            validateOrganization(org);
        });

        it('should return registrant organizations', async () => {
            const org: unknown[] = await issuerClient.organisation.getRegistrants();
            org.forEach(validateCodeName);
        });

        it('should return issuer organizations', async () => {
            const org: unknown[] = await registrantClient.organisation.getIssuers();
            org.forEach(validateCodeName);
        });
    });

    describe('Fuel and Device types', () => {
        it('should return all device types', async () => {
            const deviceTypes: DeviceType[] = await registrantClient.fuel.getDeviceTypes();

            expect(deviceTypes).to.be.an('array');
            deviceTypes.forEach((fuel) => {
                expect(fuel.code).to.be.a('string');
                expect(fuel.name).to.be.a('string');
            });
        });

        it('should return all fuel types', async () => {
            const fuelTypes: FuelType[] = await registrantClient.fuel.getFuelTypes();

            expect(fuelTypes).to.be.an('array');
            fuelTypes.forEach((type) => {
                expect(type.code).to.be.a('string');
                expect(type.name).to.be.a('string');
            });
        });
    });
});
