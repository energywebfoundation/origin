import * as fs from 'fs';
import Web3 from 'web3';
import { logger } from './Logger';
import { migrateUserRegistryContracts } from '@energyweb/user-registry/contracts';
import { migrateAssetRegistryContracts } from '@energyweb/asset-registry/contracts';
import { migrateCertificateRegistryContracts } from '@energyweb/origin/contracts';
import { migrateMarketRegistryContracts } from '@energyweb/market/contracts';

export const deployEmptyContracts = async () => {
    const connectionConfig = JSON.parse(
        fs.readFileSync('./connection-config.json', 'utf8').toString()
    );

    const web3 = new Web3(connectionConfig.develop.web3);

    const adminPK = connectionConfig.develop.deployKey.startsWith('0x')
        ? connectionConfig.develop.deployKey
        : '0x' + connectionConfig.develop.deployKey;

    console.log('-----------------------------------------------------------');

    // deploy user, asset and market contracts and store instances of lookup contracts
    const userContracts = await migrateUserRegistryContracts(web3, adminPK);
    const userContractLookup = (userContracts as any).UserContractLookup;
    const userLogic = (userContracts as any).UserLogic;
    logger.info('User Contract Deployed: ' + userContractLookup);

    const assetContracts: any = await migrateAssetRegistryContracts(
        web3,
        userContractLookup,
        adminPK
    );
    const assetContractLookup = assetContracts.AssetContractLookup;
    const assetProducingRegistryLogic = assetContracts.AssetProducingRegistryLogic;
    const assetConsumingRegistryLogic = assetContracts.AssetConsumingRegistryLogic;
    logger.info('Asset Contract Deployed: ' + assetContractLookup);

    const originContracts: any = await migrateCertificateRegistryContracts(
        web3,
        assetContractLookup,
        adminPK
    );
    const originContractLookup = originContracts.OriginContractLookup;
    const certificateLogic = originContracts.CertificateLogic;
    logger.info('Origin Contract Deployed: ' + originContractLookup);

    const marketContracts: any = await migrateMarketRegistryContracts(
        web3,
        assetContractLookup,
        originContractLookup,
        adminPK
    );
    const marketContractLookup = marketContracts.MarketContractLookup;
    const marketLogic = marketContracts.MarketLogic;
    logger.info('Market Contract Deployed: ' + marketContractLookup);

    console.log('-----------------------------------------------------------\n');

    // save addresses ina config file
    const deployResult = {} as any;
    deployResult.userContractLookup = userContractLookup;
    deployResult.assetContractLookup = assetContractLookup;
    deployResult.originContractLookup = originContractLookup;
    deployResult.marketContractLookup = marketContractLookup;
    deployResult.userLogic = userLogic;
    deployResult.assetConsumingRegistryLogic = assetConsumingRegistryLogic;
    deployResult.assetProducingRegistryLogic = assetProducingRegistryLogic;
    deployResult.certificateLogic = certificateLogic;
    deployResult.marketLogic = marketLogic;

    const writeJsonFile = require('write-json-file');
    await writeJsonFile('./config/contractConfig.json', deployResult);

    return deployResult;
};
