import { assert } from 'chai';
import dotenv from 'dotenv';
import Web3 from 'web3';
import 'mocha';
import moment from 'moment';

import { Configuration } from '@energyweb/utils-general';
import { OffChainDataSourceMock } from '@energyweb/origin-backend-client-mocks';

import { migrateIssuer, migrateRegistry } from '../migrate';
import { Certificate, Issuer } from '..';

import { logger } from '../Logger';

describe('Cerificate tests', () => {
    let conf: Configuration.Entity;
    let issuer: Issuer;

    dotenv.config({
        path: '.env.test'
    });

    const web3 = new Web3(process.env.WEB3);

    const deviceOwnerPK = '0x622d56ab7f0e75ac133722cc065260a2792bf30ea3265415fe04f3a2dba7e1ac';
    const accountDeviceOwner = web3.eth.accounts.privateKeyToAccount(deviceOwnerPK).address;

    const issuerPK = '0x50397ee7580b44c966c3975f561efb7b58a54febedaa68a5dc482e52fb696ae7';
    const issuerAccount = web3.eth.accounts.privateKeyToAccount(issuerPK).address;

    const traderPK = '0xca77c9b06fde68bcbcc09f603c958620613f4be79f3abb4b2032131d0229462e';
    const accountTrader = web3.eth.accounts.privateKeyToAccount(traderPK).address;

    let timestamp = moment()
        .subtract(10, 'year')
        .unix();

    const setActiveUser = (privateKey: string) => {
        conf.blockchainProperties.activeUser = {
            address: web3.eth.accounts.privateKeyToAccount(privateKey).address,
            privateKey
        };
    };

    const issueCertificate = async (volume: number, isPrivate: boolean = false) => {
        setActiveUser(issuerPK);

        const generationStartTime = timestamp;
        // Simulate time moving forward 1 month
        timestamp += 30 * 24 * 3600;
        const generationEndTime = timestamp;
        const deviceId = '1';

        return Certificate.createCertificate(
            accountDeviceOwner,
            volume,
            generationStartTime,
            generationEndTime,
            deviceId,
            conf,
            isPrivate
        );
    };

    it('migrates Registry', async () => {
        const registry = await migrateRegistry(web3, issuerPK);
        issuer = await migrateIssuer(web3, issuerPK, registry.web3Contract.options.address);

        conf = {
            blockchainProperties: {
                activeUser: {
                    address: issuerAccount,
                    privateKey: issuerPK
                },
                registry,
                issuer,
                web3
            },
            offChainDataSource: new OffChainDataSourceMock(),
            logger
        };
    });

    it('gets all certificates', async () => {
        const totalVolume = 1e9;

        await issueCertificate(totalVolume);
        await issueCertificate(totalVolume);

        const allCertificates = await Certificate.getAllCertificates(conf);
        assert.equal(allCertificates.length, 2);
    });

    it('issuer issues a certificate', async () => {
        const volume = 1e9;
        const certificate = await issueCertificate(volume);

        assert.isNotNull(certificate.id);

        setActiveUser(issuerPK);
        assert.isFalse(certificate.isOwned());

        assert.equal(certificate.energy, volume);

        setActiveUser(deviceOwnerPK);
        assert.isTrue(certificate.isOwned());
        assert.equal(certificate.ownedVolume(), volume);

        assert.deepOwnInclude(certificate, {
            initialized: true,
            issuer: issuer.web3Contract.options.address
        } as Partial<Certificate.Entity>);
    });

    it('transfers a certificate', async () => {
        const totalVolume = 1e9;
        let certificate = await issueCertificate(totalVolume);

        setActiveUser(deviceOwnerPK);

        await certificate.transfer(accountTrader, totalVolume / 4);

        certificate = await certificate.sync();

        assert.isTrue(certificate.isOwned(accountDeviceOwner));
        assert.equal(certificate.ownedVolume(accountDeviceOwner), (totalVolume / 4) * 3);

        assert.isTrue(certificate.isOwned(accountTrader));
        assert.equal(certificate.ownedVolume(accountTrader), totalVolume / 4);
    });

    it('transfers a private certificate', async () => {
        const totalVolume = 1e9;
        let certificate = await issueCertificate(totalVolume, true);

        setActiveUser(deviceOwnerPK);

        await certificate.transfer(accountTrader);

        certificate = await certificate.sync();

        assert.isFalse(certificate.isOwned(accountDeviceOwner));
        assert.equal(certificate.ownedVolume(accountDeviceOwner), 0);

        assert.isTrue(certificate.isOwned(accountTrader));
        assert.equal(certificate.ownedVolume(accountTrader), totalVolume);
    });

    it('fails claiming a revoked certificate', async () => {
        const totalVolume = 1e9;
        const certificate = await issueCertificate(totalVolume);

        setActiveUser(issuerPK);

        await certificate.revoke();

        setActiveUser(deviceOwnerPK);

        let failed = false;

        try {
            await certificate.claim(totalVolume);
        } catch (e) {
            failed = true;
        }

        assert.isTrue(failed);
    });

    it('claims a certificate', async () => {
        const totalVolume = 1e9;
        let certificate = await issueCertificate(totalVolume);

        setActiveUser(deviceOwnerPK);

        const amountToSendToTrader = totalVolume / 4;

        await certificate.transfer(accountTrader, amountToSendToTrader);

        certificate = await certificate.sync();

        setActiveUser(traderPK);

        await certificate.claim(amountToSendToTrader);

        certificate = await certificate.sync();

        assert.isFalse(certificate.isOwned());
        assert.equal(certificate.ownedVolume(), 0);

        assert.isTrue(certificate.isClaimed());
        assert.equal(certificate.claimedVolume(), amountToSendToTrader);
    });

    it('claims a private certificate', async () => {
        const totalVolume = 1e9;
        let certificate = await issueCertificate(totalVolume, true);

        setActiveUser(deviceOwnerPK);

        await certificate.requestMigrateToPublic();
        certificate = await certificate.sync();

        setActiveUser(issuerPK);

        await certificate.migrateToPublic();
        certificate = await certificate.sync();

        assert.isFalse(certificate.isPrivate);

        setActiveUser(deviceOwnerPK);

        await certificate.claim();
        certificate = await certificate.sync();

        assert.isTrue(await certificate.isClaimed());
        assert.equal(await certificate.claimedVolume(), totalVolume);
    });

    it('batch transfers certificates', async () => {
        const totalVolume = 1e9;

        let certificate = await issueCertificate(totalVolume);
        let certificate2 = await issueCertificate(totalVolume);

        setActiveUser(deviceOwnerPK);

        assert.isTrue(certificate.isOwned());
        assert.isTrue(certificate2.isOwned());
        assert.equal(certificate.ownedVolume(), totalVolume);
        assert.equal(certificate2.ownedVolume(), totalVolume);

        await Certificate.transferCertificates(
            [certificate.id, certificate2.id],
            accountTrader,
            conf
        );

        certificate = await certificate.sync();
        certificate2 = await certificate2.sync();

        assert.isFalse(certificate.isOwned());
        assert.isFalse(certificate2.isOwned());
        assert.equal(certificate.ownedVolume(), 0);
        assert.equal(certificate2.ownedVolume(), 0);

        assert.isTrue(certificate.isOwned(accountTrader));
        assert.isTrue(certificate2.isOwned(accountTrader));
        assert.equal(certificate.ownedVolume(accountTrader), totalVolume);
        assert.equal(certificate2.ownedVolume(accountTrader), totalVolume);
    });

    xit('batch claims certificates', async () => {
        const totalVolume = 1e9;

        let certificate = await issueCertificate(totalVolume);
        let certificate2 = await issueCertificate(totalVolume);

        setActiveUser(deviceOwnerPK);

        assert.isFalse(certificate.isClaimed());
        assert.isFalse(certificate2.isClaimed());
        assert.equal(certificate.claimedVolume(), 0);
        assert.equal(certificate2.claimedVolume(), 0);

        await Certificate.claimCertificates([certificate.id, certificate2.id], conf);

        certificate = await certificate.sync();
        certificate2 = await certificate2.sync();

        assert.isTrue(certificate.isClaimed());
        assert.isTrue(certificate2.isClaimed());
        assert.equal(certificate.claimedVolume(), totalVolume);
        assert.equal(certificate2.claimedVolume(), totalVolume);
    });
});
