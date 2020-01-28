import { assert } from 'chai';
import dotenv from 'dotenv';
import Web3 from 'web3';
import 'mocha';
import moment from 'moment';

import { Configuration } from '@energyweb/utils-general';
import { OffChainDataSourceMock } from '@energyweb/origin-backend-client-mocks';

import { migratePublicIssuer, migrateRegistry } from '../migrate';
import { RequestIssue, PublicIssuer, Registry } from '..';

import { logger } from '../Logger';

describe('PublicIssuer', () => {
    let publicIssuer: PublicIssuer;
    let registry: Registry;
    let conf: Configuration.Entity;

    dotenv.config({
        path: '.env.test'
    });

    const web3 = new Web3(process.env.WEB3);
    const deployKey = process.env.DEPLOY_KEY;

    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;
    const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;

    const deviceOwnerPK = '0xd9bc30dc17023fbb68fe3002e0ff9107b241544fd6d60863081c55e383f1b5a3';
    const accountDeviceOwner = web3.eth.accounts.privateKeyToAccount(deviceOwnerPK).address;

    const issuerPK = '0x50397ee7580b44c966c3975f561efb7b58a54febedaa68a5dc482e52fb696ae7';
    const issuerAccount = web3.eth.accounts.privateKeyToAccount(issuerPK).address;

    it('migrates PublicIssuer and Registry', async () => {
        registry = await migrateRegistry(web3, privateKeyDeployment);
        publicIssuer = await migratePublicIssuer(
            web3,
            privateKeyDeployment,
            registry.web3Contract.options.address
        );
        const version = await publicIssuer.version();

        assert.equal(version, 'v0.1');

        conf = {
            blockchainProperties: {
                activeUser: {
                    address: accountDeployment,
                    privateKey: privateKeyDeployment
                },
                issuerLogicInstance: { public: publicIssuer },
                web3
            },
            offChainDataSource: new OffChainDataSourceMock(`${process.env.BACKEND_URL}/api`),
            logger
        };
    });

    it('user correctly requests issuance', async () => {
        conf.blockchainProperties.activeUser = {
            address: accountDeviceOwner,
            privateKey: deviceOwnerPK
        };

        const now = moment();
        const fromTime = now.subtract(30, 'day').unix();
        const toTime = now.unix();
        const deviceId = '1';

        const requestIssue = await RequestIssue.createRequestIssue(
            fromTime,
            toTime,
            deviceId,
            conf
        );

        assert.isAbove(Number(requestIssue.id), -1);

        assert.deepOwnInclude(requestIssue, {
            initialized: true,
            deviceId,
            owner: accountDeviceOwner,
            fromTime,
            toTime,
            approved: false,
            isPrivate: false
        } as Partial<RequestIssue.Entity>);
    });

    it('issuer correctly approves issuance', async () => {
        conf.blockchainProperties.activeUser = {
            address: accountDeviceOwner,
            privateKey: deviceOwnerPK
        };

        const now = moment();
        const fromTime = now.subtract(30, 'day').unix();
        const toTime = now.unix();
        const deviceId = '1';

        let requestIssue = await RequestIssue.createRequestIssue(fromTime, toTime, deviceId, conf);

        conf.blockchainProperties.activeUser = {
            address: issuerAccount,
            privateKey: issuerPK
        };

        const volume = 1000;
        const certificateId = await requestIssue.approve(accountDeviceOwner, volume);

        requestIssue = await requestIssue.sync();

        assert.isTrue(requestIssue.approved);

        const deviceOwnerBalance = await registry.balanceOf(
            accountDeviceOwner,
            Number(certificateId)
        );
        assert.equal(deviceOwnerBalance, volume);
    });

    it('issuer revokes a certificate', async () => {
        conf.blockchainProperties.activeUser = {
            address: accountDeviceOwner,
            privateKey: deviceOwnerPK
        };

        const now = moment();
        const fromTime = now.subtract(30, 'day').unix();
        const toTime = now.unix();
        const deviceId = '1';

        let requestIssue = await RequestIssue.createRequestIssue(fromTime, toTime, deviceId, conf);

        conf.blockchainProperties.activeUser = {
            address: issuerAccount,
            privateKey: issuerPK
        };

        const volume = 1000;
        const certificateId = await requestIssue.approve(accountDeviceOwner, volume);

        requestIssue = await requestIssue.sync();

        assert.isTrue(requestIssue.approved);
        assert.isFalse(requestIssue.revoked);

        await requestIssue.revoke();

        requestIssue = await requestIssue.sync();
        assert.isTrue(requestIssue.revoked);

        const deviceOwnerBalance = await registry.balanceOf(accountDeviceOwner, Number(certificateId));
        assert.equal(deviceOwnerBalance, volume);
    });

});
