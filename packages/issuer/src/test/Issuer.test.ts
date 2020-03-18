import { assert } from 'chai';
import dotenv from 'dotenv';
import Web3 from 'web3';
import 'mocha';
import moment from 'moment';

import { Configuration } from '@energyweb/utils-general';
import { OffChainDataSourceMock } from '@energyweb/origin-backend-client-mocks';

import { migrateIssuer, migrateRegistry } from '../migrate';
import { CertificationRequest, Issuer, Registry } from '..';

import { logger } from '../Logger';

describe('Issuer', () => {
    let issuer: Issuer;
    let registry: Registry;
    let conf: Configuration.Entity;

    dotenv.config({
        path: '.env.test'
    });

    const web3 = new Web3(process.env.WEB3);

    const deviceOwnerPK = '0xd9bc30dc17023fbb68fe3002e0ff9107b241544fd6d60863081c55e383f1b5a3';
    const accountDeviceOwner = web3.eth.accounts.privateKeyToAccount(deviceOwnerPK).address;

    const issuerPK = '0x50397ee7580b44c966c3975f561efb7b58a54febedaa68a5dc482e52fb696ae7';
    const issuerAccount = web3.eth.accounts.privateKeyToAccount(issuerPK).address;

    let timestamp = moment()
        .subtract(10, 'year')
        .unix();

    const setActiveUser = (privateKey: string) => {
        conf.blockchainProperties.activeUser = {
            address: web3.eth.accounts.privateKeyToAccount(privateKey).address,
            privateKey
        };
    };

    const createCertificationRequest = async (
        conf: Configuration.Entity,
        energy: number,
        isPrivate: boolean = false
    ) => {
        setActiveUser(deviceOwnerPK);

        const fromTime = timestamp;
        // Simulate time moving forward 1 month
        timestamp += 30 * 24 * 3600;
        const toTime = timestamp;
        const device = '1';

        return CertificationRequest.createCertificationRequest(
            fromTime,
            toTime,
            energy,
            device,
            conf,
            [],
            isPrivate
        );
    };

    it('migrates Issuer and Registry', async () => {
        registry = await migrateRegistry(web3, issuerPK);
        issuer = await migrateIssuer(web3, issuerPK, registry.web3Contract.options.address);
        const version = await issuer.version();
        assert.equal(version, 'v0.1');

        const registryAddress = await issuer.getRegistryAddress();
        assert.equal(registryAddress, registry.web3Contract.options.address);

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

    it('user correctly requests issuance', async () => {
        setActiveUser(deviceOwnerPK);

        const fromTime = timestamp;
        // Simulate time moving forward 1 month
        timestamp += 30 * 24 * 3600;
        const toTime = timestamp;
        const device = '1';

        const certificationRequest = await CertificationRequest.createCertificationRequest(
            fromTime,
            toTime,
            1e9,
            device,
            conf,
            []
        );

        assert.isAbove(Number(certificationRequest.id), -1);

        assert.deepOwnInclude(certificationRequest, {
            initialized: true,
            device: Number(device),
            owner: accountDeviceOwner,
            fromTime,
            toTime,
            approved: false,
            isPrivate: false
        } as Partial<CertificationRequest.Entity>);
    });

    it('issuer correctly approves issuance', async () => {
        const volume = 1e9;
        let certificationRequest = await createCertificationRequest(conf, volume);

        setActiveUser(issuerPK);

        const certificateId = await certificationRequest.approve();

        certificationRequest = await certificationRequest.sync();

        assert.isTrue(certificationRequest.approved);

        const deviceOwnerBalance = await registry.balanceOf(
            accountDeviceOwner,
            Number(certificateId)
        );
        assert.equal(deviceOwnerBalance, volume);
    });

    it('issuer revokes a certificate', async () => {
        const volume = 1e9;
        let certificationRequest = await createCertificationRequest(conf, volume);

        setActiveUser(issuerPK);

        const certificateId = await certificationRequest.approve();

        certificationRequest = await certificationRequest.sync();

        assert.isTrue(certificationRequest.approved);
        assert.isFalse(certificationRequest.revoked);

        await certificationRequest.revoke();

        certificationRequest = await certificationRequest.sync();
        assert.isTrue(certificationRequest.revoked);

        const deviceOwnerBalance = await registry.balanceOf(
            accountDeviceOwner,
            Number(certificateId)
        );
        assert.equal(deviceOwnerBalance, volume);
    });

    it('should fail to request 2 certificates with the same generation period', async () => {
        setActiveUser(deviceOwnerPK);

        const fromTime = timestamp;
        // Simulate time moving forward 1 month
        timestamp += 30 * 24 * 3600;
        const toTime = timestamp;
        const device = '1';

        await CertificationRequest.createCertificationRequest(
            fromTime,
            toTime,
            1e9,
            device,
            conf,
            []
        );

        let failed = false;

        try {
            await CertificationRequest.createCertificationRequest(
                fromTime,
                toTime,
                1e9,
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
        setActiveUser(deviceOwnerPK);

        const fromTime = timestamp;
        // Simulate time moving forward 1 month
        timestamp += 30 * 24 * 3600;
        const toTime = timestamp;
        const device = '1';
        const volume = 1e9;

        let certificationRequest = await CertificationRequest.createCertificationRequest(
            fromTime,
            toTime,
            volume,
            device,
            conf,
            []
        );

        setActiveUser(issuerPK);

        await certificationRequest.approve();
        certificationRequest = await certificationRequest.sync();

        await certificationRequest.revoke();
        certificationRequest = await certificationRequest.sync();

        const newCertificationRequest = await CertificationRequest.createCertificationRequest(
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
        const volume = 1e9;
        const certificationRequest = await createCertificationRequest(conf, volume, true);

        assert.isAbove(Number(certificationRequest.id), -1);

        assert.deepOwnInclude(certificationRequest, {
            initialized: true,
            device: 1,
            owner: accountDeviceOwner,
            approved: false,
            isPrivate: true,
            energy: volume
        } as Partial<CertificationRequest.Entity>);
    });

    it('issuer correctly approves private issuance', async () => {
        const volume = 1e9;
        let certificationRequest = await createCertificationRequest(conf, volume, true);

        setActiveUser(issuerPK);

        const certificateId = await certificationRequest.approve();

        certificationRequest = await certificationRequest.sync();

        assert.isTrue(certificationRequest.approved);

        const deviceOwnerBalance = await registry.balanceOf(
            accountDeviceOwner,
            Number(certificateId)
        );
        assert.equal(deviceOwnerBalance, 0);
    });
});
