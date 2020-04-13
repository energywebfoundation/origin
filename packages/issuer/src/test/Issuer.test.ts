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

    const createCertificationRequest = async (energy: BigNumber, isPrivate = false) => {
        setActiveUser(deviceOwnerWallet);

        const fromTime = timestamp;
        // Simulate time moving forward 1 month
        timestamp += 30 * 24 * 3600;
        const toTime = timestamp;
        const device = '1';

        return CertificationRequest.create(fromTime, toTime, energy, device, conf, [], isPrivate);
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

    it('user correctly requests issuance', async () => {
        setActiveUser(deviceOwnerWallet);

        const energy = new BigNumber(1e9);
        const fromTime = timestamp;
        // Simulate time moving forward 1 month
        timestamp += 30 * 24 * 3600;
        const toTime = timestamp;
        const device = '1';

        const certificationRequest = await CertificationRequest.create(
            fromTime,
            toTime,
            energy,
            device,
            conf,
            []
        );

        assert.isAbove(certificationRequest.id, -1);

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

        certificationRequest = await certificationRequest.sync();

        assert.isTrue(certificationRequest.approved);

        const deviceOwnerBalance = await conf.blockchainProperties.registry.balanceOf(
            deviceOwnerWallet.address,
            certificateId
        );
        assert.equal(deviceOwnerBalance.toString(), volume.toString());
    });

    it('issuer revokes a certificate', async () => {
        const volume = new BigNumber(1e9);
        let certificationRequest = await createCertificationRequest(volume);

        setActiveUser(issuerWallet);

        const certificateId = await certificationRequest.approve();

        certificationRequest = await certificationRequest.sync();

        assert.isTrue(certificationRequest.approved);
        assert.isFalse(certificationRequest.revoked);

        await certificationRequest.revoke();

        certificationRequest = await certificationRequest.sync();
        assert.isTrue(certificationRequest.revoked);

        const deviceOwnerBalance = await conf.blockchainProperties.registry.balanceOf(
            deviceOwnerWallet.address,
            Number(certificateId)
        );
        assert.equal(deviceOwnerBalance.toString(), volume.toString());
    });

    it('should fail to request 2 certificates with the same generation period', async () => {
        setActiveUser(deviceOwnerWallet);

        const fromTime = timestamp;
        // Simulate time moving forward 1 month
        timestamp += 30 * 24 * 3600;
        const toTime = timestamp;
        const device = '1';

        await CertificationRequest.create(fromTime, toTime, new BigNumber(1e9), device, conf, []);

        let failed = false;

        try {
            await CertificationRequest.create(
                fromTime,
                toTime,
                new BigNumber(1e9),
                device,
                conf,
                []
            );
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

        let certificationRequest = await CertificationRequest.create(
            fromTime,
            toTime,
            volume,
            device,
            conf,
            []
        );

        setActiveUser(issuerWallet);

        await certificationRequest.approve();
        certificationRequest = await certificationRequest.sync();

        await certificationRequest.revoke();
        certificationRequest = await certificationRequest.sync();

        const newCertificationRequest = await CertificationRequest.create(
            fromTime,
            toTime,
            volume,
            device,
            conf,
            []
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

        certificationRequest = await certificationRequest.sync();

        assert.isTrue(certificationRequest.approved);

        const deviceOwnerBalance = await conf.blockchainProperties.registry.balanceOf(
            deviceOwnerWallet.address,
            Number(certificateId)
        );
        assert.equal(deviceOwnerBalance.toString(), '0');
    });
});
