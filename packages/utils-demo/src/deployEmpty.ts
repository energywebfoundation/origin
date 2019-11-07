import Web3 from 'web3';
import { logger } from './Logger';

import { migrateUserRegistryContracts } from '@energyweb/user-registry/contracts';
import { migrateAssetRegistryContracts } from '@energyweb/asset-registry/contracts';
import { migrateCertificateRegistryContracts } from '@energyweb/origin/contracts';
import { migrateMarketRegistryContracts } from '@energyweb/market/contracts';

export const deployEmptyContracts = async () => {
    const web3: Web3 = new Web3(process.env.WEB3);
    const deployKey: string = process.env.DEPLOY_KEY;

    const adminPK = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;

    console.log('-----------------------------------------------------------');

    // deploy user, asset and market contracts and store instances of lookup contracts
    const userLogic = await migrateUserRegistryContracts(web3, adminPK);
    const userLogicAddress = userLogic.web3Contract.options.address;
    logger.info('UserLogic Contract Deployed: ' + userLogicAddress);

    const assetLogic = await migrateAssetRegistryContracts(
        web3,
        userLogicAddress,
        adminPK
    );
    const assetLogicAddress = assetLogic.web3Contract.options.address;
    logger.info('AssetLogic Contract Deployed: ' + assetLogicAddress);

    const certificateLogic = await migrateCertificateRegistryContracts(
        web3,
        assetLogicAddress,
        adminPK
    );
    const certificateLogicAddress = certificateLogic.web3Contract.options.address;
    logger.info('CertificateLogic Contract Deployed: ' + certificateLogicAddress);

    const marketLogic = await migrateMarketRegistryContracts(
        web3,
        certificateLogicAddress,
        adminPK
    );
    const marketLogicAddress = marketLogic.web3Contract.options.address;
    logger.info('MarketLogic Deployed: ' + marketLogicAddress);

    console.log('-----------------------------------------------------------\n');

    // save addresses in a config file
    const deployResult = {} as any;
    deployResult.userLogic = userLogicAddress;
    deployResult.assetLogic = assetLogicAddress;
    deployResult.certificateLogic = certificateLogicAddress;
    deployResult.marketLogic = marketLogicAddress;

    const writeJsonFile = require('write-json-file');
    await writeJsonFile('./config/contractConfig.json', deployResult);

    return deployResult;
};
