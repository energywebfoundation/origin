import { assert } from 'chai';
import dotenv from 'dotenv';
import 'mocha';
import moment from 'moment';
import { BigNumber } from 'ethers/utils';

import { Configuration } from '@energyweb/utils-general';
import { OffChainDataSourceMock } from '@energyweb/origin-backend-client-mocks';

import { providers, Wallet } from 'ethers';
import { migrateIssuer, migrateRegistry } from '../migrate';
import { CertificationRequest } from '..';

import { logger } from '../Logger';

describe('Issuer', () => {
    let conf: Configuration.Entity;

    dotenv.config({
        path: '.env.test'
    });

    const provider = new providers.JsonRpcProvider(process.env.WEB3);

    const deviceOwnerPK = '0x622d56ab7f0e75ac133722cc065260a2792bf30ea3265415fe04f3a2dba7e1ac';
    const deviceOwnerWallet = new Wallet(deviceOwnerPK, provider);

    const issuerPK = '0x50397ee7580b44c966c3975f561efb7b58a54febedaa68a5dc482e52fb696ae7';
    const issuerWallet = new Wallet(issuerPK, provider);

    let timestamp = moment().subtract(10, 'year').unix();

    const setActiveUser = (wallet: Wallet) => {
        conf.blockchainProperties.activeUser = wallet;
    };

    const createCertificationRequest = async (
        energy: BigNumber,
        isPrivate = false,
        fromTime?: number,
        toTime?: number,
        deviceId?: string
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
            energy,
            device,
            conf,
            [],
            isPrivate
        );

        (conf.offChainDataSource.certificateClient as any).mockBlockchainData(
            certificationRequest.id,
            {
                owner: deviceOwnerWallet.address,
                fromTime: generationFromTime,
                toTime: generationToTime,
                created: moment().unix(),
                approved: false,
                revoked: false,
                deviceId: device
            }
        );

        return certificationRequest.sync();
    };

    it('migrates Issuer and Registry', async () => {
        const registry = await migrateRegistry(process.env.WEB3, issuerPK);
        const issuer = await migrateIssuer(process.env.WEB3, issuerPK, registry.address);
        const version = await issuer.version();
        assert.equal(version, 'v0.1');

        const registryAddress = await issuer.getRegistryAddress();
        assert.equal(registryAddress, registry.address);

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

    it('gets all certification requests', async () => {
        const totalVolume = new BigNumber(1e9);

        await createCertificationRequest(totalVolume);
        await createCertificationRequest(totalVolume);

        const allCertificationRequests = await CertificationRequest.getAll(conf);
        assert.equal(allCertificationRequests.length, 2);
    });

    it('user correctly requests issuance', async () => {
        setActiveUser(deviceOwnerWallet);

        const energy = new BigNumber(1e9);
        const fromTime = timestamp;
        // Simulate time moving forward 1 month
        timestamp += 30 * 24 * 3600;
        const toTime = timestamp;
        const device = '1';

        let certificationRequest = await createCertificationRequest(
            energy,
            false,
            fromTime,
            toTime,
            device
        );

        assert.isAbove(certificationRequest.id, -1);

        (conf.offChainDataSource.certificateClient as any).mockBlockchainData(
            certificationRequest.id,
            {
                owner: deviceOwnerWallet.address,
                fromTime,
                toTime,
                created: 123,
                approved: false,
                revoked: false,
                deviceId: device
            }
        );

        certificationRequest = await certificationRequest.sync();

        assert.deepOwnInclude(certificationRequest, {
            initialized: true,
            deviceId: device,
            owner: deviceOwnerWallet.address,
            fromTime,
            toTime,
            approved: false,
            isPrivate: false,
            energy
        } as Partial<CertificationRequest>);
    });

    it('issuer correctly approves issuance', async () => {
        const volume = new BigNumber(1e9);
        let certificationRequest = await createCertificationRequest(volume);

        setActiveUser(issuerWallet);

        const certificateId = await certificationRequest.approve();

        (conf.offChainDataSource.certificateClient as any).mockBlockchainData(
            certificationRequest.id,
            {
                approved: true
            }
        );

        certificationRequest = await certificationRequest.sync();

        assert.isTrue(certificationRequest.approved);

        const deviceOwnerBalance = await conf.blockchainProperties.registry.balanceOf(
            deviceOwnerWallet.address,
            certificateId
        );
        assert.equal(deviceOwnerBalance.toString(), volume.toString());
    });

    it('user revokes a certificationRequest', async () => {
        setActiveUser(deviceOwnerWallet);

        const volume = new BigNumber(1e9);
        let certificationRequest = await createCertificationRequest(volume);

        certificationRequest = await certificationRequest.sync();

        assert.isFalse(certificationRequest.approved);
        assert.isFalse(certificationRequest.revoked);

        await certificationRequest.revoke();

        (conf.offChainDataSource.certificateClient as any).mockBlockchainData(
            certificationRequest.id,
            {
                revoked: true
            }
        );

        certificationRequest = await certificationRequest.sync();
        assert.isTrue(certificationRequest.revoked);
    });

    it('user shouldnt be able to revoke an approved certificationRequest', async () => {
        setActiveUser(deviceOwnerWallet);

        const volume = new BigNumber(1e9);
        let certificationRequest = await createCertificationRequest(volume);

        setActiveUser(issuerWallet);
        certificationRequest = await certificationRequest.sync();

        await certificationRequest.approve();

        (conf.offChainDataSource.certificateClient as any).mockBlockchainData(
            certificationRequest.id,
            {
                approved: true
            }
        );

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

    it('should fail to request 2 certificates with the same generation period', async () => {
        setActiveUser(deviceOwnerWallet);

        const fromTime = timestamp;
        // Simulate time moving forward 1 month
        timestamp += 30 * 24 * 3600;
        const toTime = timestamp;
        const device = '1';

        await createCertificationRequest(new BigNumber(1e9), false, fromTime, toTime, device);

        let failed = false;

        try {
            await createCertificationRequest(new BigNumber(1e9), false, fromTime, toTime, device);
        } catch (e) {
            failed = true;
        }

        assert.isTrue(failed);
    });

    it('should request the same certificate after revoking one', async () => {
        setActiveUser(deviceOwnerWallet);

        const fromTime = timestamp;
        // Simulate time moving forward 1 month
        timestamp += 30 * 24 * 3600;
        const toTime = timestamp;
        const device = '1';
        const volume = new BigNumber(1e9);

        let certificationRequest = await createCertificationRequest(
            volume,
            false,
            fromTime,
            toTime,
            device
        );

        certificationRequest = await certificationRequest.sync();

        await certificationRequest.revoke();

        (conf.offChainDataSource.certificateClient as any).mockBlockchainData(
            certificationRequest.id,
            {
                revoked: true
            }
        );

        certificationRequest = await certificationRequest.sync();

        const newCertificationRequest = await createCertificationRequest(
            volume,
            false,
            fromTime,
            toTime,
            device
        );

        assert.exists(newCertificationRequest);
    });

    it('user correctly requests private issuance', async () => {
        const volume = new BigNumber(1e9);
        const certificationRequest = await createCertificationRequest(volume, true);

        assert.isAbove(Number(certificationRequest.id), -1);

        assert.deepOwnInclude(certificationRequest, {
            initialized: true,
            deviceId: '1',
            owner: deviceOwnerWallet.address,
            approved: false,
            isPrivate: true,
            energy: volume
        } as Partial<CertificationRequest>);
    });

    it('issuer correctly approves private issuance', async () => {
        const volume = new BigNumber(1e9);
        let certificationRequest = await createCertificationRequest(volume, true);

        setActiveUser(issuerWallet);

        const certificateId = await certificationRequest.approve();

        (conf.offChainDataSource.certificateClient as any).mockBlockchainData(
            certificationRequest.id,
            {
                approved: true
            }
        );

        certificationRequest = await certificationRequest.sync();

        assert.isTrue(certificationRequest.approved);

        const deviceOwnerBalance = await conf.blockchainProperties.registry.balanceOf(
            deviceOwnerWallet.address,
            Number(certificateId)
        );
        assert.equal(deviceOwnerBalance.toString(), '0');
    });
});
