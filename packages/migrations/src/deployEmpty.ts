import Web3 from 'web3';
import { logger } from './Logger';

import { Contracts as UserContracts } from '@energyweb/user-registry';
import { Contracts as DeviceContracts } from '@energyweb/device-registry';
import { Contracts as OriginContracts } from '@energyweb/origin';
import { Contracts as MarketContracts } from '@energyweb/market';

export interface DeployedContractAddresses {
    userLogic: string;
    deviceLogic: string;
    certificateLogic: string;
    marketLogic: string;
}

export async function deployEmptyContracts() {
    const web3: Web3 = new Web3(process.env.WEB3);
    const deployKey: string = process.env.DEPLOY_KEY;

    const adminPK = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;

    console.log('-----------------------------------------------------------');

    // deploy user, device and market contracts and store instances of lookup contracts
    const userLogic = await UserContracts.migrateUserRegistryContracts(web3, adminPK);
    const userLogicAddress = userLogic.web3Contract.options.address;
    logger.info('UserLogic Contract Deployed: ' + userLogicAddress);

    const deviceLogic = await DeviceContracts.migrateDeviceRegistryContracts(
        web3,
        userLogicAddress,
        adminPK
    );
    const deviceLogicAddress = deviceLogic.web3Contract.options.address;
    logger.info('DeviceLogic Contract Deployed: ' + deviceLogicAddress);

    const certificateLogic = await OriginContracts.migrateCertificateRegistryContracts(
        web3,
        deviceLogicAddress,
        adminPK
    );
    const certificateLogicAddress = certificateLogic.web3Contract.options.address;
    logger.info('CertificateLogic Contract Deployed: ' + certificateLogicAddress);

    const marketLogic = await MarketContracts.migrateMarketRegistryContracts(
        web3,
        certificateLogicAddress,
        adminPK
    );
    const marketLogicAddress = marketLogic.web3Contract.options.address;
    logger.info('MarketLogic Deployed: ' + marketLogicAddress);

    console.log('-----------------------------------------------------------\n');

    // save addresses in a config file
    const deployResult: DeployedContractAddresses = {
        userLogic: userLogicAddress,
        deviceLogic: deviceLogicAddress,
        certificateLogic: certificateLogicAddress,
        marketLogic: marketLogicAddress
    };

    const writeJsonFile = require('write-json-file');
    await writeJsonFile('./config/contractConfig.json', deployResult);

    return deployResult;
};
