import { assert } from 'chai';
import dotenv from 'dotenv';
import Web3 from 'web3';
import 'mocha';
import moment from 'moment';

import { Configuration } from '@energyweb/utils-general';
import { OffChainDataSourceMock } from '@energyweb/origin-backend-client-mocks';

import { migratePrivateIssuer, migratePublicIssuer, migrateRegistry } from '../migrate';
import { RequestIssue, PrivateIssuer, Registry, PublicIssuer } from '..';

import { logger } from '../Logger';

describe('PrivateIssuer', () => {
    let publicIssuer: PublicIssuer;
    let privateIssuer: PrivateIssuer;
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

    let timestamp = moment().subtract(10, 'year').unix();

    const setActiveUser = (privateKey: string) => {
        conf.blockchainProperties.activeUser = {
            address: web3.eth.accounts.privateKeyToAccount(privateKey).address,
            privateKey
        };
    };

    const createRequestIssue = async (conf: Configuration.Entity) => {
        setActiveUser(deviceOwnerPK);

        const fromTime = timestamp;
        // Simulate time moving forward 1 month
        timestamp += 30 * 24 * 3600;
        const toTime = timestamp;
        const deviceId = '1';

        return RequestIssue.createRequestIssue(fromTime, toTime, deviceId, conf, true);
    };

    it('migrates PrivateIssuer and Registry', async () => {
        registry = await migrateRegistry(web3, privateKeyDeployment);
        publicIssuer = await migratePublicIssuer(
            web3,
            privateKeyDeployment,
            registry.web3Contract.options.address
        );
        privateIssuer = await migratePrivateIssuer(
            web3,
            privateKeyDeployment,
            registry.web3Contract.options.address,
            publicIssuer.web3Contract.options.address
        );

        const version = await privateIssuer.version();
        assert.equal(version, 'v0.1');

        const registryAddress = await privateIssuer.getRegistryAddress();
        assert.equal(registryAddress, registry.web3Contract.options.address);

        const publicIssuerAddress = await privateIssuer.getPublicIssuerAddress();
        assert.equal(publicIssuerAddress, publicIssuer.web3Contract.options.address);

        conf = {
            blockchainProperties: {
                activeUser: {
                    address: accountDeployment,
                    privateKey: privateKeyDeployment
                },
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

    it('user correctly requests issuance', async () => {
        const requestIssue = await createRequestIssue(conf);

        assert.isAbove(Number(requestIssue.id), -1);

        assert.deepOwnInclude(requestIssue, {
            initialized: true,
            deviceId: '1',
            owner: accountDeviceOwner,
            approved: false,
            isPrivate: true
        } as Partial<RequestIssue.Entity>);
    });

    it('issuer correctly approves issuance', async () => {
        let requestIssue = await createRequestIssue(conf);

        setActiveUser(issuerPK);

        const volume = 1000;
        const certificateId = await requestIssue.approve(accountDeviceOwner, volume);

        requestIssue = await requestIssue.sync();

        assert.isTrue(requestIssue.approved);

        const deviceOwnerBalance = await registry.balanceOf(
            accountDeviceOwner,
            Number(certificateId)
        );
        assert.equal(deviceOwnerBalance, 0);
    });
});
