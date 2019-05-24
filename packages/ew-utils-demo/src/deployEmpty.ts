// Copyright 2018 Energy Web Foundation
// This file is part of the Origin Application brought to you by the Energy Web Foundation,
// a global non-profit organization focused on accelerating blockchain technology across the energy sector,
// incorporated in Zug, Switzerland.
//
// The Origin Application is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY and without an implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
//
// @authors: slock.it GmbH; Heiko Burkhardt, heiko.burkhardt@slock.it; Martin Kuechler, martin.kuchler@slock.it; Chirag Parmar, chirag.parmar@slock.it

import * as fs from 'fs';
import Web3 from 'web3';
import { logger } from './Logger';
import { migrateUserRegistryContracts } from 'ew-user-registry-lib';
import { migrateAssetRegistryContracts } from 'ew-asset-registry-lib';
import { migrateCertificateRegistryContracts } from 'ew-origin-lib';
import { migrateMarketRegistryContracts } from 'ew-market-lib';

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

    const assetContracts : any = await migrateAssetRegistryContracts(web3, userContractLookup, adminPK);
    const assetContractLookup = assetContracts.AssetContractLookup;
    const assetProducingRegistryLogic = assetContracts.AssetProducingRegistryLogic;
    const assetConsumingRegistryLogic = assetContracts.AssetConsumingRegistryLogic;
    logger.info('Asset Contract Deployed: ' + assetContractLookup);

    const originContracts : any = await migrateCertificateRegistryContracts(
        web3,
        assetContractLookup,
        adminPK
    );
    const originContractLookup = originContracts.OriginContractLookup;
    const certificateLogic = originContracts.CertificateLogic;
    logger.info('Origin Contract Deployed: ' + originContractLookup);

    const marketContracts : any = await migrateMarketRegistryContracts(
        web3,
        assetContractLookup,
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
