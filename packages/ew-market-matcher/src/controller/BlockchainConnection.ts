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
// @authors: slock.it GmbH, Heiko Burkhardt, heiko.burkhardt@slock.it

import * as EwAsset from 'ew-asset-registry-lib';
import * as EwOrigin from 'ew-origin-lib';
import * as EwGeneral from 'ew-utils-general-lib';
import * as EwMarket from 'ew-market-lib';
import * as Winston from 'winston';
import { Controller } from './Controller';
import Web3 = require('web3');
import * as Conf from '../../conf.json';

export const initMatchingManager = async (
    controller: Controller,
    conf: EwGeneral.Configuration.Entity,
    escrowAddress: string,
) => {

    conf.logger.verbose('* Getting all porducing assets');
    const assetList = (await EwAsset .ProducingAsset.getAllAssets(conf));
    assetList.forEach(async (asset: EwAsset.ProducingAsset.Entity) =>
        controller.registerProducingAsset(asset),
    );

    conf.logger.verbose('* Getting all consuming assets');
    const consumingAssetList = (await EwAsset.ConsumingAsset.getAllAssets(conf));
    consumingAssetList.forEach(async (asset: EwAsset.ConsumingAsset.Entity) => 
        controller.registerConsumingAsset(asset as EwAsset.ConsumingAsset.Entity),
    );
    
    conf.logger.verbose('* Getting all active demands');
    const agreementList = (await EwMarket.Agreement. .getAllAssets(conf));
  
};

export const startMatcher = async (
    controller: Controller,
    originContractLookupAddress: string,
    marketContractLookupAddress: string,
    logger: Winston.Logger,
    matcherAddress: string,
) => {

    const web3 = new Web3(Conf.web3Url);
    const blockchainProperties: EwGeneral.Configuration.BlockchainProperties = await EwOrigin
        .createBlockchainProperties(logger, web3, originContractLookupAddress);
    blockchainProperties.marketLogicInstance = (await EwMarket.createBlockchainProperties(
        logger,
        web3,
        marketContractLookupAddress)
    ).marketLogicInstance;

    const conf: EwGeneral.Configuration.Entity = {logger, blockchainProperties};

    await initEventHandling(controller, conf, matcherAddress);
};

export const initEventHandling = async (
    controller: Controller,
    conf: EwGeneral.Configuration.Entity,
    matcherAddress: string,
) => {
    // const currentBlockNumber = await blockchainProperties.web3.eth.getBlockNumber();

    // const certificateContractEventHandler = new EwfCoo.ContractEventHandler(blockchainProperties.certificateLogicInstance, currentBlockNumber);
    // certificateContractEventHandler.onEvent('LogCreatedCertificate' , async (event) => {
        
    //     if (matcherAddress === event.returnValues.escrow) {
    //         console.log('\n* Event: LogCreatedCertificate certificate hold in trust id: ' + event.returnValues._certificateId);
    //         const newCertificate = await new EwfCoo.Certificate(event.returnValues._certificateId, blockchainProperties).syncWithBlockchain();
    //         // cobntroller.registerCertificate(newCertificate)   
    //     }
        
    // });

    // certificateContractEventHandler.onEvent('LogCertificateOwnerChanged' , async (event) => {
        
    //     if (matcherAddress === event.returnValues._oldEscrow && matcherAddress !== event.returnValues._newEscrow) {
    //         console.log('\n* Event: LogCertificateOwnerChanged certificate escrow changed certificate id: ' + event.returnValues._certificateId);
            
    //         // cobntroller.removeCertificate(parseInt(event.returnValues._certificateId, 10))
    //     }
        
    // });

    // const demandContractEventHandler = new EwfCoo.ContractEventHandler(blockchainProperties.demandLogicInstance, currentBlockNumber);

    // demandContractEventHandler.onEvent('LogDemandFullyCreated', async (event) => {
    //     console.log('\n* Event: LogDemandFullyCreated demand: ' + event.returnValues._demandId);
    //     const newDemand = await new EwfCoo.Demand(event.returnValues._demandId, blockchainProperties).syncWithBlockchain();
    //     await cobntroller.registerDemand(newDemand);
    //     // matchingManager.matchDemandWithCertificatesHoldInTrust(newDemand)

    // });

    // demandContractEventHandler.onEvent('LogDemandExpired', async (event) => {
    //     console.log('\n* Event: LogDemandExpired demand: ' + event.returnValues._demandId);
    //     cobntroller.removeDemand(parseInt(event.returnValues._demandId, 10));

    // });

    // const assetContractEventHandler = new EwfCoo.ContractEventHandler(blockchainProperties.producingAssetLogicInstance, currentBlockNumber);

    // // assetContractEventHandler.onEvent('LogNewMeterRead', (event) => 
    // //     cobntroller.match()
    // // )

    // assetContractEventHandler.onEvent('LogAssetFullyInitialized', async (event) => {
    //     console.log('\n* Event: LogAssetFullyInitialized asset: ' + event.returnValues._assetId);
    //     const newAsset = await new EwfCoo.ProducingAsset(event.returnValues._assetId, blockchainProperties).syncWithBlockchain();
    //     cobntroller.registerProducingAsset(newAsset);

    // });

    // assetContractEventHandler.onEvent('LogAssetSetActive' , async (event) => {
    //     console.log('\n* Event: LogAssetSetActive  asset: ' + event.returnValues._assetId);
    
    //     const asset = await (new EwfCoo.ProducingAsset(event.returnValues._assetId, blockchainProperties)).syncWithBlockchain();
    //     cobntroller.registerProducingAsset(asset);

    // });

    // assetContractEventHandler.onEvent('LogAssetSetInactive' , async (event) => {
    //     console.log('\n* Event: LogAssetSetInactive asset: ' + event.returnValues._assetId);

    //     cobntroller.removeProducingAsset(parseInt(event.returnValues._assetId, 10));
        
    // });

    // const consumingAssetContractEventHandler = new EwfCoo.ContractEventHandler(blockchainProperties.consumingAssetLogicInstance, currentBlockNumber);

    // consumingAssetContractEventHandler.onEvent('LogNewMeterRead', async (event) => {
    //     console.log('\n* Event: LogNewMeterRead consuming asset: ' + event.returnValues._assetId);
    //     const asset = await cobntroller.createOrRefreshConsumingAsset(event.returnValues._assetId);
    //     console.log('*> Meter read: '  + asset.lastSmartMeterReadWh + ' Wh');

    // });

    // consumingAssetContractEventHandler.onEvent('LogAssetFullyInitialized', async (event) => {
    //     console.log('\n* Event: LogAssetFullyInitialized consuming asset: ' + event.returnValues._assetId);
    //     const newAsset = await new EwfCoo.ConsumingAsset(event.returnValues._assetId , blockchainProperties).syncWithBlockchain();
    //     cobntroller.registerConsumingAsset(newAsset);

    // });

    // consumingAssetContractEventHandler.onEvent('LogAssetSetActive' , async (event) => {
    //     console.log('\n* Event: LogAssetSetActive consuming asset: ' + event.returnValues._assetId);
    
    //     const asset = await (new EwfCoo.ConsumingAsset(event.returnValues._assetId, blockchainProperties)).syncWithBlockchain();
    //     cobntroller.registerConsumingAsset(asset);

    // });

    // consumingAssetContractEventHandler.onEvent('LogAssetSetInactive' , async (event) => {
    //     console.log('\n* Event: LogAssetSetInactive consuming asset: ' + event.returnValues._assetId);

    //     cobntroller.removeConsumingAsset(parseInt(event.returnValues._assetId, 10));
        
    // });
    
    // const eventHandlerManager = new EwfCoo.EventHandlerManager(4000, blockchainProperties);
    // eventHandlerManager.registerEventHandler(consumingAssetContractEventHandler);
    // eventHandlerManager.registerEventHandler(demandContractEventHandler);
    // eventHandlerManager.registerEventHandler(assetContractEventHandler);
    // eventHandlerManager.registerEventHandler(certificateContractEventHandler);
    // eventHandlerManager.start();
};
