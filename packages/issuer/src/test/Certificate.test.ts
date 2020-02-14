import { assert } from 'chai';
import dotenv from 'dotenv';
import Web3 from 'web3';
import 'mocha';
import moment from 'moment';

import { Configuration } from '@energyweb/utils-general';
import { OffChainDataSourceMock } from '@energyweb/origin-backend-client-mocks';

import { migratePublicIssuer, migrateRegistry, migratePrivateIssuer } from '../migrate';
import { Certificate, PublicIssuer, PrivateIssuer } from '..';

import { logger } from '../Logger';

describe('Cerificate tests', () => {
    let conf: Configuration.Entity;
    let publicIssuer: PublicIssuer;
    let privateIssuer: PrivateIssuer;

    dotenv.config({
        path: '.env.test'
    });

    const web3 = new Web3(process.env.WEB3);
    const deployKey = process.env.DEPLOY_KEY;

    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;
    const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;

    const deviceOwnerPK = '0x622d56ab7f0e75ac133722cc065260a2792bf30ea3265415fe04f3a2dba7e1ac';
    const accountDeviceOwner = web3.eth.accounts.privateKeyToAccount(deviceOwnerPK).address;

    const issuerPK = '0x50397ee7580b44c966c3975f561efb7b58a54febedaa68a5dc482e52fb696ae7';
    const issuerAccount = web3.eth.accounts.privateKeyToAccount(issuerPK).address;

    const traderPK = '0xca77c9b06fde68bcbcc09f603c958620613f4be79f3abb4b2032131d0229462e';
    const accountTrader = web3.eth.accounts.privateKeyToAccount(traderPK).address;

    let timestamp = moment().subtract(10, 'year').unix();

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
        const registry = await migrateRegistry(web3, privateKeyDeployment);
        publicIssuer = await migratePublicIssuer(web3, issuerPK, registry.web3Contract.options.address);
        privateIssuer = await migratePrivateIssuer(
            web3,
            issuerPK,
            registry.web3Contract.options.address,
            publicIssuer.web3Contract.options.address
        );

        conf = {
            blockchainProperties: {
                activeUser: {
                    address: accountDeployment,
                    privateKey: privateKeyDeployment
                },
                certificateLogicInstance: registry,
                issuerLogicInstance: {
                    public: publicIssuer,
                    private: privateIssuer
                },
                web3
            },
            offChainDataSource: new OffChainDataSourceMock(),
            logger
        };
    });

    it('issuer issues a certificate', async () => {
        const volume = 1e9;
        const certificate = await issueCertificate(volume);

        assert.isNotNull(certificate.id);

        setActiveUser(issuerPK);
        assert.isFalse(await certificate.isOwned());

        setActiveUser(deviceOwnerPK);
        assert.isTrue(await certificate.isOwned());
        const ownedVolume = await certificate.ownedVolume();

        assert.equal(ownedVolume, volume);

        assert.deepOwnInclude(certificate, {
            initialized: true,
            issuer: publicIssuer.web3Contract.options.address
        } as Partial<Certificate.ICertificate>);
    });

    it('transfers a certificate', async () => {
        const totalVolume = 1e9;
        const certificate = await issueCertificate(totalVolume);

        setActiveUser(deviceOwnerPK);

        await certificate.transfer(accountTrader, totalVolume / 4);

        assert.isTrue(await certificate.isOwned(accountDeviceOwner));
        assert.equal(await certificate.ownedVolume(accountDeviceOwner), (totalVolume / 4) * 3);

        assert.isTrue(await certificate.isOwned(accountTrader));
        assert.equal(await certificate.ownedVolume(accountTrader), totalVolume / 4);
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
        const certificate = await issueCertificate(totalVolume);

        setActiveUser(deviceOwnerPK);

        const amountToSendToTrader = totalVolume / 4;

        await certificate.transfer(accountTrader, amountToSendToTrader);

        setActiveUser(traderPK);

        await certificate.claim(amountToSendToTrader);

        assert.isFalse(await certificate.isOwned());
        assert.equal(await certificate.ownedVolume(), 0);

        assert.isTrue(await certificate.isClaimed());
        assert.equal(await certificate.claimedVolume(), amountToSendToTrader);
    });

    it('batch transfers certificates', async () => {
        const totalVolume = 1e9;

        let certificate = await issueCertificate(totalVolume);
        let certificate2 = await issueCertificate(totalVolume);

        setActiveUser(deviceOwnerPK);

        assert.isTrue(await certificate.isOwned());
        assert.isTrue(await certificate2.isOwned());
        assert.equal(await certificate.ownedVolume(), totalVolume);
        assert.equal(await certificate2.ownedVolume(), totalVolume);

        await Certificate.transferCertificates(
            [certificate.id, certificate2.id],
            accountTrader,
            conf
        );

        certificate = await certificate.sync();
        certificate2 = await certificate2.sync();

        assert.isFalse(await certificate.isOwned());
        assert.isFalse(await certificate2.isOwned());
        assert.equal(await certificate.ownedVolume(), 0);
        assert.equal(await certificate2.ownedVolume(), 0);

        assert.isTrue(await certificate.isOwned(accountTrader));
        assert.isTrue(await certificate2.isOwned(accountTrader));
        assert.equal(await certificate.ownedVolume(accountTrader), totalVolume);
        assert.equal(await certificate2.ownedVolume(accountTrader), totalVolume);
    });

    it('batch claims certificates', async () => {
        const totalVolume = 1e9;

        let certificate = await issueCertificate(totalVolume);
        let certificate2 = await issueCertificate(totalVolume);

        setActiveUser(deviceOwnerPK);

        assert.isFalse(await certificate.isClaimed());
        assert.isFalse(await certificate2.isClaimed());
        assert.equal(await certificate.claimedVolume(), 0);
        assert.equal(await certificate2.claimedVolume(), 0);

        await Certificate.claimCertificates(
            [certificate.id, certificate2.id],
            conf
        );

        certificate = await certificate.sync();
        certificate2 = await certificate2.sync();

        assert.isTrue(await certificate.isClaimed());
        assert.isTrue(await certificate2.isClaimed());
        assert.equal(await certificate.claimedVolume(), totalVolume);
        assert.equal(await certificate2.claimedVolume(), totalVolume);
    });
});
