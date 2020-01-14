import { assert } from 'chai';
import dotenv from 'dotenv';
import Web3 from 'web3';
import 'mocha';
import moment from 'moment';

import { Configuration } from '@energyweb/utils-general';
import { OffChainDataClientMock, ConfigurationClientMock } from '@energyweb/origin-backend-client';

import { migratePublicIssuer, migrateRegistry } from '../migrate';
import {  Certificate } from '..';

import { logger } from '../Logger';

describe('Registry tests', () => {
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

    const traderPK = '0xca77c9b06fde68bcbcc09f603c958620613f4be79f3abb4b2032131d0229462e';
    const accountTrader = web3.eth.accounts.privateKeyToAccount(traderPK).address;

    const setActiveUser = (privateKey: string) => {
        conf.blockchainProperties.activeUser = {
            address: web3.eth.accounts.privateKeyToAccount(privateKey).address,
            privateKey
        };
    }

    const issueCertificate = async (volume: number, conf: Configuration.Entity) => {
        setActiveUser(issuerPK);

        const now = moment();
        const generationStartTime = now.subtract(30, 'day').unix();
        const generationEndTime = now.unix();
        const deviceId = '1';

        return Certificate.createCertificate(
            accountDeviceOwner,
            'isValid()',
            volume,
            generationStartTime,
            generationEndTime,
            deviceId,
            conf
        );
    }

    it('migrates Registry', async () => {
        const registry = await migrateRegistry(web3, privateKeyDeployment);
        const publicIssuer = await migratePublicIssuer(web3, privateKeyDeployment, registry.web3Contract.options.address);

        conf = {
            blockchainProperties: {
                activeUser: {
                    address: accountDeployment,
                    privateKey: privateKeyDeployment
                },
                certificateLogicInstance: registry,
                issuerLogicInstance: { public: publicIssuer },
                web3
            },
            offChainDataSource: {
                baseUrl: `${process.env.BACKEND_URL}/api`,
                client: new OffChainDataClientMock(),
                configurationClient: new ConfigurationClientMock()
            },
            logger
        };
    });

    it('issuer issues a certificate', async () => {
        const volume = 123;
        const certificate = await issueCertificate(volume, conf);

        assert.isNotNull(certificate.id);

        setActiveUser(issuerPK);
        assert.isFalse(await certificate.isOwned());

        setActiveUser(deviceOwnerPK);
        assert.isTrue(await certificate.isOwned());
        const ownedVolume = await certificate.ownedVolume();

        assert.equal(ownedVolume, volume);

        assert.deepOwnInclude(certificate, {
            initialized: true,
            issuer: issuerAccount
        } as Partial<Certificate.ICertificate>);
    });

    it('transfers a certificate', async () => {
        const totalVolume = 100;
        const certificate = await issueCertificate(totalVolume, conf);

        setActiveUser(deviceOwnerPK);

        await certificate.transfer(accountTrader, totalVolume / 4);

        assert.isTrue(await certificate.isOwned());
        assert.equal(await certificate.ownedVolume(), (totalVolume / 4) * 3);

        setActiveUser(traderPK);

        assert.isTrue(await certificate.isOwned());
        assert.equal(await certificate.ownedVolume(), totalVolume / 4);
    });

    it('claims a certificate', async () => {
        const totalVolume = 1000;
        const certificate = await issueCertificate(totalVolume, conf);

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

});
