import { assert } from 'chai';
import dotenv from 'dotenv';
import 'mocha';
import moment from 'moment';
import { Wallet, BigNumber } from 'ethers';

import { getProviderWithFallback } from '@energyweb/utils-general';

import { migrateIssuer, migrateRegistry } from '../src/migrate';
import { Certificate, CertificateUtils, IClaimData, IBlockchainProperties } from '../src';

describe('Certificate tests', () => {
    let blockchainProperties: IBlockchainProperties;

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

    const totalVolume = BigNumber.from(1e9);

    const claimData: IClaimData = {
        beneficiary: 'Testing beneficiary 1234',
        address: 'Random address 123, Somewhere',
        region: 'Northernmost Region',
        zipCode: '321-45',
        countryCode: 'DE',
        fromDate: moment('2020-01-01').toISOString(),
        toDate: moment('2020-02-1').toISOString()
    };

    const emptyClaimData: IClaimData = {
        beneficiary: '',
        address: '',
        region: '',
        zipCode: '',
        countryCode: '',
        fromDate: '',
        toDate: ''
    };

    const setActiveUser = (wallet: Wallet) => {
        blockchainProperties.activeUser = wallet;
    };

    const issueCertificate = async (volume: BigNumber, address: string, metadata?: string) => {
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
            blockchainProperties,
            metadata
        );
    };

    it('migrates Registry', async () => {
        const registry = await migrateRegistry(provider, issuerPK);
        const issuer = await migrateIssuer(provider, issuerPK, registry.address);

        blockchainProperties = {
            web3: provider,
            activeUser: issuerWallet,
            registry,
            issuer
        };
    });

    it('gets all certificates', async () => {
        await issueCertificate(totalVolume, deviceOwnerWallet.address);
        await issueCertificate(totalVolume, deviceOwnerWallet.address);

        const allCertificates = await CertificateUtils.getAllCertificates(blockchainProperties);
        assert.equal(allCertificates.length, 2);
    });

    it('gets all owned certificates', async () => {
        await issueCertificate(totalVolume, deviceOwnerWallet.address);
        await issueCertificate(totalVolume, traderWallet.address);

        setActiveUser(traderWallet);
        const [certificate] = await CertificateUtils.getAllOwnedCertificates(blockchainProperties);
        assert.isDefined(certificate);

        await certificate.transfer(deviceOwnerWallet.address, totalVolume);

        const myCertificates = await CertificateUtils.getAllOwnedCertificates(blockchainProperties);
        assert.lengthOf(myCertificates, 0);
    });

    it('issuer issues a certificate', async () => {
        let certificate = await issueCertificate(totalVolume, deviceOwnerWallet.address);

        assert.isNotNull(certificate.id);

        setActiveUser(issuerWallet);
        certificate = await certificate.sync();

        assert.equal(certificate.owners[issuerWallet.address], undefined);
        assert.equal(certificate.owners[deviceOwnerWallet.address], totalVolume.toString());

        assert.deepOwnInclude(certificate, {
            initialized: true,
            issuer: blockchainProperties.issuer.address
        } as Partial<Certificate>);
    });

    it('transfers a certificate', async () => {
        let certificate = await issueCertificate(totalVolume, deviceOwnerWallet.address);

        setActiveUser(deviceOwnerWallet);
        certificate = await certificate.sync();

        assert.equal(certificate.owners[deviceOwnerWallet.address], totalVolume.toString());

        await certificate.transfer(traderWallet.address, totalVolume.div(4));

        certificate = await certificate.sync();

        assert.deepInclude(certificate.owners, {
            [deviceOwnerWallet.address]: totalVolume.div(4).mul(3).toString(),
            [traderWallet.address]: totalVolume.div(4).toString()
        });
    });

    it('fails transferring a revoked certificate', async () => {
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
        let certificate = await issueCertificate(totalVolume, deviceOwnerWallet.address);

        setActiveUser(deviceOwnerWallet);
        certificate = await certificate.sync();

        const amountToSendToTrader = totalVolume.div(4);

        await certificate.transfer(traderWallet.address, amountToSendToTrader);

        certificate = await certificate.sync();

        setActiveUser(traderWallet);

        await certificate.claim(claimData, amountToSendToTrader);

        certificate = await certificate.sync();

        assert.equal(certificate.owners[traderWallet.address], '0');
        assert.equal(certificate.claimers[traderWallet.address], amountToSendToTrader.toString());
    });

    it('partially claims a certificate', async () => {
        let certificate = await issueCertificate(totalVolume, deviceOwnerWallet.address);

        setActiveUser(deviceOwnerWallet);
        certificate = await certificate.sync();

        await certificate.claim(claimData, totalVolume.div(2));

        certificate = await certificate.sync();

        assert.equal(certificate.owners[deviceOwnerWallet.address], totalVolume.div(2).toString());
        assert.equal(
            certificate.claimers[deviceOwnerWallet.address],
            totalVolume.div(2).toString()
        );
    });

    it('claims a certificate with empty beneficiary', async () => {
        let certificate = await issueCertificate(totalVolume, deviceOwnerWallet.address);

        setActiveUser(deviceOwnerWallet);
        certificate = await certificate.sync();

        await certificate.claim(emptyClaimData, totalVolume);

        certificate = await certificate.sync();

        const claims = await certificate.getClaimedData();

        assert.isTrue(
            claims.some(
                (claim) => JSON.stringify(claim.claimData) === JSON.stringify(emptyClaimData)
            )
        );
    });

    it('batch transfers certificates', async () => {
        let certificate = await issueCertificate(totalVolume, deviceOwnerWallet.address);
        let certificate2 = await issueCertificate(totalVolume, deviceOwnerWallet.address);

        setActiveUser(deviceOwnerWallet);
        certificate = await certificate.sync();
        certificate2 = await certificate2.sync();

        assert.equal(certificate.owners[deviceOwnerWallet.address], totalVolume.toString());
        assert.equal(certificate2.owners[deviceOwnerWallet.address], totalVolume.toString());

        await CertificateUtils.transferCertificates(
            [certificate.id, certificate2.id],
            traderWallet.address,
            blockchainProperties
        );

        certificate = await certificate.sync();
        certificate2 = await certificate2.sync();

        assert.deepInclude(certificate.owners, {
            [deviceOwnerWallet.address]: '0',
            [traderWallet.address]: totalVolume.toString()
        });
        assert.deepInclude(certificate2.owners, {
            [deviceOwnerWallet.address]: '0',
            [traderWallet.address]: totalVolume.toString()
        });
    });

    it('batch claims certificates', async () => {
        let certificate = await issueCertificate(totalVolume, deviceOwnerWallet.address);
        let certificate2 = await issueCertificate(totalVolume, deviceOwnerWallet.address);

        setActiveUser(deviceOwnerWallet);

        assert.equal(certificate.claimers[deviceOwnerWallet.address], undefined);
        assert.equal(certificate2.claimers[deviceOwnerWallet.address], undefined);

        await CertificateUtils.claimCertificates(
            [certificate.id, certificate2.id],
            claimData,
            blockchainProperties
        );

        certificate = await certificate.sync();
        certificate2 = await certificate2.sync();

        assert.equal(certificate.claimers[deviceOwnerWallet.address], totalVolume.toString());
        assert.equal(certificate2.claimers[deviceOwnerWallet.address], totalVolume.toString());
    });

    it(`should not be able to claim another user's certificate`, async () => {
        let certificate = await issueCertificate(totalVolume, deviceOwnerWallet.address);

        setActiveUser(traderWallet);
        certificate = await certificate.sync();

        let failed = false;

        try {
            await certificate.claim(
                claimData,
                totalVolume,
                deviceOwnerWallet.address,
                traderWallet.address
            );
        } catch (e) {
            failed = true;
        }

        assert.isTrue(failed);
    });

    it(`should not be able force another user to claim its certificates`, async () => {
        let certificate = await issueCertificate(totalVolume, deviceOwnerWallet.address);

        setActiveUser(traderWallet);
        certificate = await certificate.sync();

        let failed = false;

        try {
            await certificate.claim(
                claimData,
                totalVolume,
                deviceOwnerWallet.address,
                deviceOwnerWallet.address
            );
        } catch (e) {
            failed = true;
        }

        assert.isTrue(failed);
    });

    it(`should not be able force another user to batch claim its certificates`, async () => {
        const certificate = await issueCertificate(totalVolume, deviceOwnerWallet.address);
        const certificate2 = await issueCertificate(totalVolume, deviceOwnerWallet.address);

        setActiveUser(traderWallet);

        let failed = false;

        try {
            await CertificateUtils.claimCertificates(
                [certificate.id, certificate2.id],
                claimData,
                blockchainProperties,
                deviceOwnerWallet.address
            );
        } catch (e) {
            failed = true;
        }

        assert.isTrue(failed);
    });

    it('stores the metadata', async () => {
        const metadata = { someRandomId: '123ID' };
        let certificate = await issueCertificate(
            totalVolume,
            deviceOwnerWallet.address,
            JSON.stringify(metadata)
        );

        assert.equal(JSON.parse(certificate.metadata).someRandomId, metadata.someRandomId);
    });
});
