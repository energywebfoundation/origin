import * as fs from 'fs';
import Web3 from 'web3';

import { Configuration } from '@energyweb/utils-general';
import { UserLogic } from '@energyweb/user-registry';
import { DeviceLogic } from '@energyweb/device-registry';
import { OffChainDataSource } from '@energyweb/origin-backend-client';
import { IContractsLookup } from '@energyweb/origin-backend-core';
import { Registry, Issuer } from '@energyweb/issuer';

import { certificateDemo } from './certificate';
import { logger } from './Logger';

export const marketDemo = async (demoConfigPath: string, contractConfig: IContractsLookup) => {
    const startTime = Date.now();

    const web3: Web3 = new Web3(process.env.WEB3);
    const deployKey: string = process.env.DEPLOY_KEY;

    const demoConfig = JSON.parse(
        fs.readFileSync(demoConfigPath ?? './config/demo-config.json', 'utf8').toString()
    );

    const adminPK = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;

    const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPK);

    // create logic instances
    const userLogic = new UserLogic(web3, contractConfig.userLogic);
    const deviceProducingRegistryLogic = new DeviceLogic(web3, contractConfig.deviceLogic);
    const registry = new Registry(web3, contractConfig.registry);
    const issuer = new Issuer(web3, contractConfig.issuer);

    const offChainDataSource = new OffChainDataSource(
        process.env.BACKEND_URL,
        Number(process.env.BACKEND_PORT)
    );

    const conf: Configuration.Entity = {
        blockchainProperties: {
            activeUser: {
                address: adminAccount.address,
                privateKey: adminPK
            },
            deviceLogicInstance: deviceProducingRegistryLogic,
            registry,
            userLogicInstance: userLogic,
            issuer,
            web3
        },
        offChainDataSource,
        logger
    };

    const actionsArray = demoConfig.flow;

    for (const action of actionsArray) {
        const passString = JSON.stringify(action);
        await certificateDemo(passString, conf, adminPK);
    }

    conf.logger.info(`Total Time: ${(Date.now() - startTime) / 1000} seconds`);
    offChainDataSource.eventClient.stop();
};
