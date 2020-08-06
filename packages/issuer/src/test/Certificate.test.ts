import { assert } from 'chai';
import dotenv from 'dotenv';
import 'mocha';
import moment from 'moment';
import { Wallet, BigNumber } from 'ethers';

import { Configuration, getProviderWithFallback } from '@energyweb/utils-general';
import { OffChainDataSourceMock } from '@energyweb/origin-backend-client-mocks';

import { IOwnershipCommitmentStatus } from '@energyweb/origin-backend-core';
import { migrateIssuer, migrateRegistry } from '../migrate';
import { Certificate, CertificateUtils, IClaimData } from '..';

import { logger } from '../Logger';
import { MockCertificate } from './MockCertificate';

describe('Certificate tests', () => {
    let conf: Configuration.Entity;

    dotenv.config({
        path: '.env.test'
    });

    const [web3Url] = process.env.WEB3.split(';');
    const provider = getProviderWithFallback(web3Url);

    const deviceOwnerPK = '0x622d56ab7f0e75ac133722cc065260a2792bf30ea3265415fe04f3a2dba7e1ac';
    const deviceOwnerWallet = new Wallet(deviceOwnerPK, provider);

    const issuerPK = '0x50397ee7580b44c966c3975f561efb7b58a54febedaa68a5dc482e52fb696ae7';
    const issuerWallet = new Wallet(issuerPK, provider);

    const traderPK = '0xca77c9b06fde68bcbcc09f603c958620613f4be79f3abb4b2032131d0229462e';
    const traderWallet = new Wallet(traderPK, provider);

    let timestamp = moment().subtract(10, 'year').unix();

    const claimData: IClaimData = {
        beneficiary: 'Testing beneficiary 1234',
        address: 'Random address 123, Somewhere',
        region: 'Northernmost Region',
        zipCode: '321-45',
        countryCode: 'DE'
    };

    const emptyClaimData: IClaimData = {
        beneficiary: '',
        address: '',
        region: '',
        zipCode: '',
        countryCode: ''
    };

    const setActiveUser = (wallet: Wallet) => {
        conf.blockchainProperties.activeUser = wallet;
    };

    const issueCertificate = async (volume: BigNumber, address: string, isPrivate = false) => {
        setActiveUser(issuerWallet);

        const generationStartTime = timestamp;
        // Simulate time moving forward 1 month
        timestamp += 30 * 24 * 3600;
        const generationEndTime = timestamp;
        const deviceId = '1';

        return Certificate.create(
            address,
            volume,
            generationStartTime,
            generationEndTime,
            deviceId,
            conf,
            isPrivate
        );
    };

    it('migrates Registry', async () => {
        const registry = await migrateRegistry(provider, issuerPK);
        const issuer = await migrateIssuer(provider, issuerPK, registry.address);

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
        const totalVolume = BigNumber.from(1e9);

        await issueCertificate(totalVolume, deviceOwnerWallet.address);
        await issueCertificate(totalVolume, deviceOwnerWallet.address);

        const allCertificates = await CertificateUtils.getAllCertificates(conf);
        assert.equal(allCertificates.length, 2);
    });

    it('gets all owned certificates', async () => {
        const totalVolume = BigNumber.from(1e9);

        await issueCertificate(totalVolume, deviceOwnerWallet.address);
        await issueCertificate(totalVolume, traderWallet.address);

        setActiveUser(traderWallet);
        const [certificate] = await CertificateUtils.getAllOwnedCertificates(conf);
        assert.isDefined(certificate);

        await certificate.transfer(deviceOwnerWallet.address, totalVolume);

        const myCertificates = await CertificateUtils.getAllOwnedCertificates(conf);
        assert.lengthOf(myCertificates, 0);
    });

    it('issuer issues a certificate', async () => {
        const volume = BigNumber.from(1e9);
        let certificate = await issueCertificate(volume, deviceOwnerWallet.address);

        assert.isNotNull(certificate.id);

        setActiveUser(issuerWallet);
        certificate = await certificate.sync();
        assert.isFalse(certificate.isOwned);

        assert.equal(certificate.energy.publicVolume.toString(), '0');

        setActiveUser(deviceOwnerWallet);
        certificate = await certificate.sync();
        assert.isTrue(certificate.isOwned);
        assert.equal(certificate.energy.publicVolume.toString(), volume.toString());

        assert.deepOwnInclude(certificate, {
            initialized: true,
            issuer: conf.blockchainProperties.issuer.address
        } as Partial<Certificate>);
    });

    it('transfers a certificate', async () => {
        const totalVolume = BigNumber.from(1e9);
        let certificate = await issueCertificate(totalVolume, deviceOwnerWallet.address);

        setActiveUser(deviceOwnerWallet);
        certificate = await certificate.sync();

        assert.equal(certificate.energy.publicVolume.toString(), totalVolume.toString());

        await certificate.transfer(traderWallet.address, totalVolume.div(4));

        certificate = await certificate.sync();

        assert.isTrue(certificate.isOwned);
        assert.equal(
            certificate.energy.publicVolume.toString(),
            totalVolume.div(4).mul(3).toString()
        );

        setActiveUser(traderWallet);
        certificate = await certificate.sync();

        assert.isTrue(certificate.isOwned);
        assert.equal(certificate.energy.publicVolume.toString(), totalVolume.div(4).toString());
    });

    it('transfers a private certificate', async () => {
        const totalVolume = BigNumber.from(1e9);
        let certificate = await issueCertificate(totalVolume, deviceOwnerWallet.address, true);

        setActiveUser(deviceOwnerWallet);
        certificate = await certificate.sync();

        const { proof } = (await certificate.transfer(
            traderWallet.address,
            totalVolume,
            true
        )) as IOwnershipCommitmentStatus;
        certificate = await certificate.sync();

        setActiveUser(issuerWallet);

        const mockedCertificate = await new MockCertificate(certificate.id, conf).sync();

        await (mockedCertificate as MockCertificate).approvePrivateTransfer(proof);

        setActiveUser(deviceOwnerWallet);
        certificate = await certificate.sync();

        assert.isFalse(certificate.isOwned);
        assert.equal(certificate.energy.privateVolume.toString(), '0');

        setActiveUser(traderWallet);
        certificate = await certificate.sync();

        assert.isTrue(certificate.isOwned);
        assert.equal(certificate.energy.privateVolume.toString(), totalVolume.toString());
    });

    it('partially transfers a private certificate', async () => {
        const totalVolume = BigNumber.from(1e9);
        const partialVolumeToSend = totalVolume.div(4);
        let certificate = await issueCertificate(totalVolume, deviceOwnerWallet.address, true);

        setActiveUser(deviceOwnerWallet);
        certificate = await certificate.sync();

        const { proof } = (await certificate.transfer(
            traderWallet.address,
            partialVolumeToSend,
            true
        )) as IOwnershipCommitmentStatus;
        certificate = await certificate.sync();

        setActiveUser(issuerWallet);

        const mockedCertificate = await new MockCertificate(certificate.id, conf).sync();

        await (mockedCertificate as MockCertificate).approvePrivateTransfer(proof);

        setActiveUser(deviceOwnerWallet);
        certificate = await certificate.sync();

        assert.isTrue(certificate.isOwned);
        assert.equal(
            certificate.energy.privateVolume.toString(),
            totalVolume.sub(partialVolumeToSend).toString()
        );

        setActiveUser(traderWallet);
        certificate = await certificate.sync();

        assert.isTrue(certificate.isOwned);
        assert.equal(certificate.energy.privateVolume.toString(), partialVolumeToSend.toString());
    });

    it('fails transferring a revoked certificate', async () => {
        const totalVolume = BigNumber.from(1e9);
        let certificate = await issueCertificate(totalVolume, deviceOwnerWallet.address);

        setActiveUser(issuerWallet);

        await certificate.revoke();

        setActiveUser(deviceOwnerWallet);
        certificate = await certificate.sync();

        let failed = false;

        try {
            await certificate.transfer(traderWallet.address);
        } catch (e) {
            failed = true;
        }

        assert.isTrue(failed);
    });

    it('fails claiming a revoked certificate', async () => {
        const totalVolume = BigNumber.from(1e9);
        let certificate = await issueCertificate(totalVolume, deviceOwnerWallet.address);

        setActiveUser(issuerWallet);

        await certificate.revoke();

        setActiveUser(deviceOwnerWallet);
        certificate = await certificate.sync();

        let failed = false;

        try {
            await certificate.claim({}, totalVolume);
        } catch (e) {
            failed = true;
        }

        assert.isTrue(failed);
    });

    it('claims a certificate', async () => {
        const totalVolume = BigNumber.from(1e9);
        let certificate = await issueCertificate(totalVolume, deviceOwnerWallet.address);

        setActiveUser(deviceOwnerWallet);
        certificate = await certificate.sync();

        const amountToSendToTrader = totalVolume.div(4);

        await certificate.transfer(traderWallet.address, amountToSendToTrader);

        certificate = await certificate.sync();

        setActiveUser(traderWallet);

        await certificate.claim(claimData, amountToSendToTrader);

        certificate = await certificate.sync();

        assert.isFalse(certificate.isOwned);
        assert.equal(certificate.energy.publicVolume.toString(), '0');

        assert.isTrue(certificate.isClaimed);
        assert.equal(certificate.energy.claimedVolume.toString(), amountToSendToTrader.toString());

        assert.isTrue(
            certificate.claims.some(
                (claim) => JSON.stringify(claim.claimData) === JSON.stringify(claimData)
            )
        );
    });

    it('partially claims a certificate', async () => {
        const totalVolume = BigNumber.from(1e9);
        let certificate = await issueCertificate(totalVolume, deviceOwnerWallet.address);

        setActiveUser(deviceOwnerWallet);
        certificate = await certificate.sync();

        await certificate.claim(claimData, totalVolume.div(2));

        certificate = await certificate.sync();

        assert.isTrue(certificate.isOwned);
        assert.equal(certificate.energy.publicVolume.toString(), totalVolume.div(2).toString());

        assert.isTrue(certificate.isClaimed);
        assert.equal(certificate.energy.claimedVolume.toString(), totalVolume.div(2).toString());
    });

    it('claims a certificate with empty beneficiary', async () => {
        const totalVolume = BigNumber.from(1e9);
        let certificate = await issueCertificate(totalVolume, deviceOwnerWallet.address);

        setActiveUser(deviceOwnerWallet);
        certificate = await certificate.sync();

        await certificate.claim(emptyClaimData, totalVolume);

        certificate = await certificate.sync();

        assert.isTrue(
            certificate.claims.some(
                (claim) => JSON.stringify(claim.claimData) === JSON.stringify(emptyClaimData)
            )
        );
    });

    it('claims a private certificate', async () => {
        const totalVolume = BigNumber.from(1e9);
        let certificate = await issueCertificate(totalVolume, deviceOwnerWallet.address, true);

        setActiveUser(deviceOwnerWallet);
        certificate = await certificate.sync();

        await certificate.requestMigrateToPublic();

        setActiveUser(issuerWallet);
        certificate = await certificate.sync();

        const mockedCertificate = await new MockCertificate(certificate.id, conf).sync();

        await (mockedCertificate as MockCertificate).migrateToPublic();

        setActiveUser(deviceOwnerWallet);
        certificate = await certificate.sync();

        await certificate.claim(claimData);

        certificate = await certificate.sync();

        assert.isTrue(certificate.isClaimed);
        assert.equal(certificate.energy.claimedVolume.toString(), totalVolume.toString());

        assert.isTrue(
            certificate.claims.some(
                (claim) => JSON.stringify(claim.claimData) === JSON.stringify(claimData)
            )
        );
    });

    it('claims a partial private certificate', async () => {
        const totalVolume = BigNumber.from(1e9);
        const partialVolumeToClaim = totalVolume.div(4);
        let certificate = await issueCertificate(totalVolume, deviceOwnerWallet.address, true);

        setActiveUser(deviceOwnerWallet);
        certificate = await certificate.sync();

        const { proof } = (await certificate.transfer(
            traderWallet.address,
            partialVolumeToClaim,
            true
        )) as IOwnershipCommitmentStatus;

        setActiveUser(issuerWallet);
        certificate = await certificate.sync();

        let mockedCertificate = await new MockCertificate(certificate.id, conf).sync();
        await (mockedCertificate as MockCertificate).approvePrivateTransfer(proof);

        setActiveUser(traderWallet);
        certificate = await certificate.sync();

        await certificate.requestMigrateToPublic();

        setActiveUser(issuerWallet);
        certificate = await certificate.sync();

        mockedCertificate = await mockedCertificate.sync();
        await (mockedCertificate as MockCertificate).migrateToPublic();

        setActiveUser(traderWallet);
        certificate = await certificate.sync();

        await certificate.claim(claimData);
        certificate = await certificate.sync();

        assert.isTrue(certificate.isClaimed);
        assert.equal(certificate.energy.claimedVolume.toString(), partialVolumeToClaim.toString());

        assert.isTrue(
            certificate.claims.some(
                (claim) => JSON.stringify(claim.claimData) === JSON.stringify(claimData)
            )
        );
    });

    it('batch transfers certificates', async () => {
        const totalVolume = BigNumber.from(1e9);

        let certificate = await issueCertificate(totalVolume, deviceOwnerWallet.address);
        let certificate2 = await issueCertificate(totalVolume, deviceOwnerWallet.address);

        setActiveUser(deviceOwnerWallet);
        certificate = await certificate.sync();
        certificate2 = await certificate2.sync();

        assert.isTrue(certificate.isOwned);
        assert.isTrue(certificate2.isOwned);
        assert.equal(certificate.energy.publicVolume.toString(), totalVolume.toString());
        assert.equal(certificate2.energy.publicVolume.toString(), totalVolume.toString());

        await CertificateUtils.transferCertificates(
            [certificate.id, certificate2.id],
            traderWallet.address,
            conf
        );

        certificate = await certificate.sync();
        certificate2 = await certificate2.sync();

        assert.isFalse(certificate.isOwned);
        assert.isFalse(certificate2.isOwned);
        assert.equal(certificate.energy.publicVolume.toString(), '0');
        assert.equal(certificate2.energy.publicVolume.toString(), '0');

        setActiveUser(traderWallet);

        certificate = await certificate.sync();
        certificate2 = await certificate2.sync();

        assert.isTrue(certificate.isOwned);
        assert.isTrue(certificate2.isOwned);
        assert.equal(certificate.energy.publicVolume.toString(), totalVolume.toString());
        assert.equal(certificate2.energy.publicVolume.toString(), totalVolume.toString());
    });

    it('batch claims certificates', async () => {
        const totalVolume = BigNumber.from(1e9);

        let certificate = await issueCertificate(totalVolume, deviceOwnerWallet.address);
        let certificate2 = await issueCertificate(totalVolume, deviceOwnerWallet.address);

        setActiveUser(deviceOwnerWallet);
        certificate = await certificate.sync();

        assert.isFalse(certificate.isClaimed);
        assert.isFalse(certificate2.isClaimed);
        assert.equal(certificate.energy.claimedVolume.toString(), '0');
        assert.equal(certificate2.energy.claimedVolume.toString(), '0');

        await CertificateUtils.claimCertificates(
            [certificate.id, certificate2.id],
            claimData,
            conf
        );

        certificate = await certificate.sync();
        certificate2 = await certificate2.sync();

        assert.isTrue(certificate.isClaimed);
        assert.isTrue(certificate2.isClaimed);
        assert.equal(certificate.energy.claimedVolume.toString(), totalVolume.toString());
        assert.equal(certificate2.energy.claimedVolume.toString(), totalVolume.toString());

        assert.isTrue(
            certificate.claims.some(
                (claim) => JSON.stringify(claim.claimData) === JSON.stringify(claimData)
            )
        );
    });
});
