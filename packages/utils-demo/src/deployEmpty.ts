import Web3 from 'web3';
import { logger } from './Logger';

import * as UserRegistry from '@energyweb/user-registry';
import * as AssetRegistry from '@energyweb/asset-registry';
import * as Origin from '@energyweb/origin';
import * as Market from '@energyweb/market';

export async function deployEmptyContracts() {
    const web3: Web3 = new Web3(process.env.WEB3);
    const deployKey: string = process.env.DEPLOY_KEY;

    const adminPK = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;

    console.log('-----------------------------------------------------------');

    // deploy user, asset and market contracts and store instances of lookup contracts
    const userLogic = await UserRegistry.Contracts.migrateUserRegistryContracts(web3, adminPK);
    const userLogicAddress = userLogic.web3Contract.options.address;
    logger.info('UserLogic Contract Deployed: ' + userLogicAddress);

    const assetLogic = await AssetRegistry.Contracts.migrateAssetRegistryContracts(
        web3,
        userLogicAddress,
        adminPK
    );
    const assetLogicAddress = assetLogic.web3Contract.options.address;
    logger.info('AssetLogic Contract Deployed: ' + assetLogicAddress);

    const certificateLogic = await Origin.Contracts.migrateCertificateRegistryContracts(
        web3,
        assetLogicAddress,
        adminPK
    );
    const certificateLogicAddress = certificateLogic.web3Contract.options.address;
    logger.info('CertificateLogic Contract Deployed: ' + certificateLogicAddress);

    const marketLogic = await Market.Contracts.migrateMarketRegistryContracts(
        web3,
        certificateLogicAddress,
        adminPK
    );
    const marketLogicAddress = marketLogic.web3Contract.options.address;
    logger.info('MarketLogic Deployed: ' + marketLogicAddress);

    console.log('-----------------------------------------------------------\n');

    // save addresses in a config file
    const deployResult = {
        userLogic: userLogicAddress,
        assetLogic: assetLogicAddress,
        certificateLogic: certificateLogicAddress,
        marketLogic: marketLogicAddress
    };

    const writeJsonFile = require('write-json-file');
    await writeJsonFile('./config/contractConfig.json', deployResult);

    return deployResult;
};
