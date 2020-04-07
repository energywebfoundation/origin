import { assert } from 'chai';
import dotenv from 'dotenv';
import 'mocha';
import moment from 'moment';
import { providers, Wallet } from 'ethers';
import { BigNumber } from 'ethers/utils';

import { Configuration } from '@energyweb/utils-general';
import { OffChainDataSourceMock } from '@energyweb/origin-backend-client-mocks';

import { migrateIssuer, migrateRegistry } from '../migrate';
import { Certificate } from '..';

import { logger } from '../Logger';

describe('Certificate tests', () => {
    let conf: Configuration.Entity;

    dotenv.config({
        path: '.env.test'
    });

    const provider = new providers.JsonRpcProvider(process.env.WEB3);

    const deviceOwnerPK = '0x622d56ab7f0e75ac133722cc065260a2792bf30ea3265415fe04f3a2dba7e1ac';
    const deviceOwnerWallet = new Wallet(deviceOwnerPK, provider);

    const issuerPK = '0x50397ee7580b44c966c3975f561efb7b58a54febedaa68a5dc482e52fb696ae7';
    const issuerWallet = new Wallet(issuerPK, provider);

    const traderPK = '0xca77c9b06fde68bcbcc09f603c958620613f4be79f3abb4b2032131d0229462e';
    const traderWallet = new Wallet(traderPK, provider);

    let timestamp = moment().subtract(10, 'year').unix();

    const setActiveUser = (wallet: Wallet) => {
        conf.blockchainProperties.activeUser = wallet;
    };

    const issueCertificate = async (volume: BigNumber, isPrivate = false) => {
        setActiveUser(issuerWallet);

        const generationStartTime = timestamp;
        // Simulate time moving forward 1 month
        timestamp += 30 * 24 * 3600;
        const generationEndTime = timestamp;
        const deviceId = '1';

        return Certificate.createCertificate(
            deviceOwnerWallet.address,
            volume,
            generationStartTime,
            generationEndTime,
            deviceId,
            conf,
            isPrivate
        );
    };

    it('migrates Registry', async () => {
        const registry = await migrateRegistry(process.env.WEB3, issuerPK);
        const issuer = await migrateIssuer(process.env.WEB3, issuerPK, registry.address);

        conf = {
            blockchainProperties: {
                activeUser: issuerWallet,
                registry,
                issuer
            },
            offChainDataSource: new OffChainDataSourceMock(),
            logger
        };
    });

    it('gets all certificates', async () => {
        const totalVolume = new BigNumber(1e9);

        await issueCertificate(totalVolume);
        await issueCertificate(totalVolume);

        const allCertificates = await Certificate.getAllCertificates(conf);
        assert.equal(allCertificates.length, 2);
    });

    it('issuer issues a certificate', async () => {
        const volume = new BigNumber(1e9);
        const certificate = await issueCertificate(volume);

        assert.isNotNull(certificate.id);

        setActiveUser(issuerWallet);
        assert.isFalse(certificate.isOwned());

        assert.equal(certificate.energy.toString(), volume.toString());

        setActiveUser(deviceOwnerWallet);
        assert.isTrue(certificate.isOwned());
        assert.equal(certificate.ownedVolume().publicVolume.toString(), volume.toString());

        assert.deepOwnInclude(certificate, {
            initialized: true,
            issuer: conf.blockchainProperties.issuer.address
        } as Partial<Certificate.Entity>);
    });

    it('transfers a certificate', async () => {
        const totalVolume = new BigNumber(1e9);
        let certificate = await issueCertificate(totalVolume);

        setActiveUser(deviceOwnerWallet);

        await certificate.transfer(traderWallet.address, totalVolume.div(4));

        certificate = await certificate.sync();

        assert.isTrue(certificate.isOwned(deviceOwnerWallet.address));
        assert.equal(
            certificate.ownedVolume(deviceOwnerWallet.address).publicVolume.toString(),
            totalVolume.div(4).mul(3).toString()
        );

        assert.isTrue(certificate.isOwned(traderWallet.address));
        assert.equal(
            certificate.ownedVolume(traderWallet.address).publicVolume.toString(),
            totalVolume.div(4).toString()
        );
    });

    it('transfers a private certificate', async () => {
        const totalVolume = new BigNumber(1e9);
        let certificate = await issueCertificate(totalVolume, true);

        setActiveUser(deviceOwnerWallet);

        await certificate.transfer(traderWallet.address, totalVolume, true);
        certificate = await certificate.sync();

        setActiveUser(issuerWallet);

        await certificate.approvePrivateTransfer();
        certificate = await certificate.sync();

        assert.isFalse(certificate.isOwned(deviceOwnerWallet.address));
        assert.equal(
            certificate.ownedVolume(deviceOwnerWallet.address).privateVolume.toString(),
            '0'
        );

        assert.isTrue(certificate.isOwned(traderWallet.address));
        assert.equal(
            certificate.ownedVolume(traderWallet.address).privateVolume.toString(),
            totalVolume.toString()
        );
    });

    it('partially transfers a private certificate', async () => {
        const totalVolume = new BigNumber(1e9);
        const partialVolumeToSend = totalVolume.div(4);
        let certificate = await issueCertificate(totalVolume, true);

        setActiveUser(deviceOwnerWallet);

        await certificate.transfer(traderWallet.address, partialVolumeToSend, true);
        certificate = await certificate.sync();

        setActiveUser(issuerWallet);

        await certificate.approvePrivateTransfer();
        certificate = await certificate.sync();

        assert.isTrue(certificate.isOwned(deviceOwnerWallet.address));
        assert.equal(
            certificate.ownedVolume(deviceOwnerWallet.address).privateVolume.toString(),
            totalVolume.sub(partialVolumeToSend).toString()
        );

        assert.isTrue(certificate.isOwned(traderWallet.address));
        assert.equal(
            certificate.ownedVolume(traderWallet.address).privateVolume.toString(),
            partialVolumeToSend.toString()
        );
    });

    it('fails claiming a revoked certificate', async () => {
        const totalVolume = new BigNumber(1e9);
        const certificate = await issueCertificate(totalVolume);

        setActiveUser(issuerWallet);

        await certificate.revoke();

        setActiveUser(deviceOwnerWallet);

        let failed = false;

        try {
            await certificate.claim(totalVolume);
        } catch (e) {
            failed = true;
        }

        assert.isTrue(failed);
    });

    it('claims a certificate', async () => {
        const totalVolume = new BigNumber(1e9);
        let certificate = await issueCertificate(totalVolume);

        setActiveUser(deviceOwnerWallet);

        const amountToSendToTrader = totalVolume.div(4);

        await certificate.transfer(traderWallet.address, amountToSendToTrader);

        certificate = await certificate.sync();

        setActiveUser(traderWallet);

        await certificate.claim(amountToSendToTrader);

        certificate = await certificate.sync();

        assert.isFalse(certificate.isOwned());
        assert.equal(certificate.ownedVolume().publicVolume.toString(), '0');

        assert.isTrue(certificate.isClaimed());
        assert.equal(certificate.claimedVolume().toString(), amountToSendToTrader.toString());
    });

    it('claims a private certificate', async () => {
        const totalVolume = new BigNumber(1e9);
        let certificate = await issueCertificate(totalVolume, true);

        setActiveUser(deviceOwnerWallet);

        await certificate.requestMigrateToPublic();
        certificate = await certificate.sync();

        setActiveUser(issuerWallet);

        await certificate.migrateToPublic();
        certificate = await certificate.sync();

        setActiveUser(deviceOwnerWallet);

        await certificate.claim();
        certificate = await certificate.sync();

        assert.isTrue(certificate.isClaimed());
        assert.equal(certificate.claimedVolume().toString(), totalVolume.toString());
    });

    it('claims a partial private certificate', async () => {
        const totalVolume = new BigNumber(1e9);
        const partialVolumeToClaim = totalVolume.div(4);
        let certificate = await issueCertificate(totalVolume, true);

        setActiveUser(deviceOwnerWallet);

        await certificate.transfer(traderWallet.address, partialVolumeToClaim, true);
        certificate = await certificate.sync();

        setActiveUser(issuerWallet);

        await certificate.approvePrivateTransfer();
        certificate = await certificate.sync();

        setActiveUser(traderWallet);

        await certificate.requestMigrateToPublic();
        certificate = await certificate.sync();

        setActiveUser(issuerWallet);

        await certificate.migrateToPublic();
        certificate = await certificate.sync();

        setActiveUser(traderWallet);

        await certificate.claim();
        certificate = await certificate.sync();

        assert.isTrue(certificate.isClaimed());
        assert.equal(certificate.claimedVolume().toString(), partialVolumeToClaim.toString());
    });

    it('batch transfers certificates', async () => {
        const totalVolume = new BigNumber(1e9);

        let certificate = await issueCertificate(totalVolume);
        let certificate2 = await issueCertificate(totalVolume);

        setActiveUser(deviceOwnerWallet);

        assert.isTrue(certificate.isOwned());
        assert.isTrue(certificate2.isOwned());
        assert.equal(certificate.ownedVolume().publicVolume.toString(), totalVolume.toString());
        assert.equal(certificate2.ownedVolume().publicVolume.toString(), totalVolume.toString());

        await Certificate.transferCertificates(
            [certificate.id, certificate2.id],
            traderWallet.address,
            conf
        );

        certificate = await certificate.sync();
        certificate2 = await certificate2.sync();

        assert.isFalse(certificate.isOwned());
        assert.isFalse(certificate2.isOwned());
        assert.equal(certificate.ownedVolume().publicVolume.toString(), '0');
        assert.equal(certificate2.ownedVolume().publicVolume.toString(), '0');

        assert.isTrue(certificate.isOwned(traderWallet.address));
        assert.isTrue(certificate2.isOwned(traderWallet.address));
        assert.equal(
            certificate.ownedVolume(traderWallet.address).publicVolume.toString(),
            totalVolume.toString()
        );
        assert.equal(
            certificate2.ownedVolume(traderWallet.address).publicVolume.toString(),
            totalVolume.toString()
        );
    });

    it('batch claims certificates', async () => {
        const totalVolume = new BigNumber(1e9);

        let certificate = await issueCertificate(totalVolume);
        let certificate2 = await issueCertificate(totalVolume);

        setActiveUser(deviceOwnerWallet);

        assert.isFalse(certificate.isClaimed());
        assert.isFalse(certificate2.isClaimed());
        assert.equal(certificate.claimedVolume().toString(), '0');
        assert.equal(certificate2.claimedVolume().toString(), '0');

        await Certificate.claimCertificates([certificate.id, certificate2.id], conf);

        certificate = await certificate.sync();
        certificate2 = await certificate2.sync();

        assert.isTrue(certificate.isClaimed());
        assert.isTrue(certificate2.isClaimed());
        assert.equal(certificate.claimedVolume().toString(), totalVolume.toString());
        assert.equal(certificate2.claimedVolume().toString(), totalVolume.toString());
    });
});
