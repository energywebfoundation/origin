import { assert } from 'chai';
import dotenv from 'dotenv';
import 'mocha';
import moment from 'moment';

import { getProviderWithFallback } from '@energyweb/utils-general';

import { Wallet, BigNumber } from 'ethers';
import { migrateIssuer, migrateRegistry } from '../migrate';
import { CertificationRequest, IBlockchainProperties } from '..';

describe('Issuer', () => {
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

    let timestamp = moment().subtract(10, 'year').unix();

    const setActiveUser = (wallet: Wallet) => {
        blockchainProperties.activeUser = wallet;
    };

    const createCertificationRequest = async (
        fromTime?: number,
        toTime?: number,
        deviceId?: string,
        forAddress?: string
    ) => {
        setActiveUser(deviceOwnerWallet);

        const generationFromTime = fromTime ?? timestamp;
        // Simulate time moving forward 1 month
        timestamp += 30 * 24 * 3600;
        const generationToTime = toTime ?? timestamp;
        const device = deviceId ?? '1';

        const certificationRequest = await CertificationRequest.create(
            generationFromTime,
            generationToTime,
            device,
            blockchainProperties,
            forAddress
        );

        return certificationRequest;
    };

    it('migrates Issuer and Registry', async () => {
        const registry = await migrateRegistry(provider, issuerPK);
        const issuer = await migrateIssuer(provider, issuerPK, registry.address);
        const version = await issuer.version();
        assert.equal(version, 'v0.1');

        const registryAddress = await issuer.getRegistryAddress();
        assert.equal(registryAddress, registry.address);

        blockchainProperties = {
            web3: provider,
            activeUser: issuerWallet,
            registry,
            issuer
        };
    });

    it('gets all certification requests', async () => {
        await createCertificationRequest();
        await createCertificationRequest();

        const allCertificationRequests = await CertificationRequest.getAll(blockchainProperties);
        assert.equal(allCertificationRequests.length, 2);
    });

    it('user correctly requests issuance', async () => {
        setActiveUser(deviceOwnerWallet);

        const fromTime = timestamp;
        // Simulate time moving forward 1 month
        timestamp += 30 * 24 * 3600;
        const toTime = timestamp;
        const device = '1';

        const certificationRequest = await createCertificationRequest(fromTime, toTime, device);

        assert.isAbove(certificationRequest.id, -1);

        assert.deepOwnInclude(certificationRequest, {
            deviceId: device,
            owner: deviceOwnerWallet.address,
            fromTime,
            toTime,
            approved: false
        } as Partial<CertificationRequest>);
    });

    it('issuer correctly approves issuance', async () => {
        const volume = BigNumber.from(1e9);
        let certificationRequest = await createCertificationRequest();

        setActiveUser(issuerWallet);

        const certificateId = await certificationRequest.approve(volume);

        certificationRequest = await certificationRequest.sync();

        assert.isTrue(certificationRequest.approved);
        assert.exists(certificationRequest.issuedCertificateTokenId);

        const deviceOwnerBalance = await blockchainProperties.registry.balanceOf(
            deviceOwnerWallet.address,
            certificateId
        );
        assert.equal(deviceOwnerBalance.toString(), volume.toString());
    });

    it('user revokes a certificationRequest', async () => {
        setActiveUser(deviceOwnerWallet);

        let certificationRequest = await createCertificationRequest();

        certificationRequest = await certificationRequest.sync();

        assert.isFalse(certificationRequest.approved);
        assert.isFalse(certificationRequest.revoked);

        await certificationRequest.revoke();

        certificationRequest = await certificationRequest.sync();
        assert.isTrue(certificationRequest.revoked);
    });

    it('issuer should be able to revoke a certificationRequest', async () => {
        setActiveUser(issuerWallet);

        let certificationRequest = await createCertificationRequest();

        certificationRequest = await certificationRequest.sync();

        assert.isFalse(certificationRequest.revoked);

        await certificationRequest.revoke();

        certificationRequest = await certificationRequest.sync();
        assert.isTrue(certificationRequest.revoked);
    });

    it('user shouldnt be able to revoke an approved certificationRequest', async () => {
        setActiveUser(deviceOwnerWallet);

        const volume = BigNumber.from(1e9);
        let certificationRequest = await createCertificationRequest();

        setActiveUser(issuerWallet);
        certificationRequest = await certificationRequest.sync();

        await certificationRequest.approve(volume);

        setActiveUser(deviceOwnerWallet);
        certificationRequest = await certificationRequest.sync();

        assert.isTrue(certificationRequest.approved);
        assert.isFalse(certificationRequest.revoked);

        let failed = false;

        try {
            await certificationRequest.revoke();
        } catch (e) {
            failed = true;
        }

        assert.isTrue(failed);
    });

    // it('should fail to request 2 certificates with the same generation period', async () => {
    //     setActiveUser(deviceOwnerWallet);

    //     const fromTime = timestamp;
    //     // Simulate time moving forward 1 month
    //     timestamp += 30 * 24 * 3600;
    //     const toTime = timestamp;
    //     const device = '1';

    //     await createCertificationRequest(fromTime, toTime, device);

    //     let failed = false;

    //     try {
    //         await createCertificationRequest(fromTime, toTime, device);
    //     } catch (e) {
    //         failed = true;
    //     }

    //     assert.isTrue(failed);
    // });

    it('should request the same certificate after revoking one', async () => {
        setActiveUser(deviceOwnerWallet);

        const fromTime = timestamp;
        // Simulate time moving forward 1 month
        timestamp += 30 * 24 * 3600;
        const toTime = timestamp;
        const device = '1';

        let certificationRequest = await createCertificationRequest(fromTime, toTime, device);

        certificationRequest = await certificationRequest.sync();

        await certificationRequest.revoke();

        certificationRequest = await certificationRequest.sync();

        const newCertificationRequest = await createCertificationRequest(fromTime, toTime, device);

        assert.exists(newCertificationRequest);
    });

    // it('user correctly requests private issuance', async () => {
    //     const volume = BigNumber.from(1e9);
    //     const certificationRequest = await createCertificationRequest(volume);

    //     assert.isAbove(Number(certificationRequest.id), -1);

    //     assert.deepOwnInclude(certificationRequest, {
    //         deviceId: '1',
    //         owner: deviceOwnerWallet.address,
    //         approved: false,
    //         energy: volume
    //     } as Partial<CertificationRequest>);
    // });

    // it('issuer correctly approves private issuance', async () => {
    //     const volume = BigNumber.from(1e9);
    //     let certificationRequest = await createCertificationRequest(volume);

    //     setActiveUser(issuerWallet);

    //     const certificateId = await certificationRequest.approve();

    //     certificationRequest = await certificationRequest.sync();

    //     assert.isTrue(certificationRequest.approved);

    //     const deviceOwnerBalance = await blockchainProperties.registry.balanceOf(
    //         deviceOwnerWallet.address,
    //         Number(certificateId)
    //     );
    //     assert.equal(deviceOwnerBalance.toString(), '0');
    // });

    it('should be able to request for other address', async () => {
        setActiveUser(deviceOwnerWallet);

        const fromTime = timestamp;
        // Simulate time moving forward 1 month
        timestamp += 30 * 24 * 3600;
        const toTime = timestamp;
        const device = '1';

        const certificationRequest = await createCertificationRequest(
            fromTime,
            toTime,
            device,
            issuerWallet.address
        );

        assert.isOk(certificationRequest);
    });
});
