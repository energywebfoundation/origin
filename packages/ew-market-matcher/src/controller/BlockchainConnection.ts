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
// @authors: slock.it GmbH; Heiko Burkhardt, heiko.burkhardt@slock.it; Martin Kuechler, martin.kuchler@slock.it

import * as EwAsset from 'ew-asset-registry-lib';
import * as EwOrigin from 'ew-origin-lib';
import * as EwGeneral from 'ew-utils-general-lib';
import * as EwMarket from 'ew-market-lib';
import { logger } from '../Logger';
import * as Winston from 'winston';
import { Controller } from './Controller';
import Web3 from 'web3';
import * as Conf from '../../conf.json';
import { BlockchainDataSourceType, BlockchainDataSource } from '../schema-defs/MatcherConf';
import { EthAccount } from 'ew-utils-general-lib/dist/js/blockchain-facade/Configuration';




export const initMatchingManager = async (
    controller: Controller,
    conf: EwGeneral.Configuration.Entity,
) => {

    conf.logger.verbose('* Getting all porducing assets');
    const assetList = (await EwAsset .ProducingAsset.getAllAssets(conf));
    assetList.forEach(async (asset: EwAsset.ProducingAsset.Entity) =>
        controller.registerProducingAsset(asset),
    );

    // conf.logger.verbose('* Getting all consuming assets');
    // const consumingAssetList = (await EwAsset.ConsumingAsset.getAllAssets(conf));
    // consumingAssetList.forEach(async (asset: EwAsset.ConsumingAsset.Entity) =>
    //     controller.registerConsumingAsset(asset as EwAsset.ConsumingAsset.Entity),
    // );



    conf.logger.verbose('* Getting all active agreements');
    const agreementListLength = (await EwMarket.Agreement.getAgreementListLength(conf));
    for (let i = 0; i < agreementListLength; i++) {
        controller.registerAgreement(await new EwMarket.Agreement.Entity(i.toString(), conf).sync());
    }

    conf.logger.verbose('* Getting all active demands');
    const demandListLength = (await EwMarket.Demand.getDemandListLength(conf));
    for (let i = 0; i < demandListLength; i++) {
        controller.registerDemand(await new EwMarket.Demand.Entity(i.toString(), conf).sync());
    }

    conf.logger.verbose('* Getting all active supplies');
    const supplyListLength = (await EwMarket.Supply.getSupplyListLength(conf));
    for (let i = 0; i < supplyListLength; i++) {
        controller.registerSupply(await new EwMarket.Supply.Entity(i.toString(), conf).sync());
    }

    conf.logger.verbose('* Getting all certificates');
    const certificateListLength = (await EwOrigin.Certificate.getCertificateListLength(conf));
    for (let i = 0; i < certificateListLength; i++) {
        const newCertificate = await new EwOrigin.Certificate.Entity(i.toString(),conf,).sync();
        await controller.matchTrigger(newCertificate);
    }

};

export const createBlockchainConf = async (
    blockchainSectionConfFile: BlockchainDataSource,
    matcherAccount: EthAccount,
): Promise<EwGeneral.Configuration.Entity> => {
    const web3 = new Web3(blockchainSectionConfFile.web3Url);
    const marketConf = await EwMarket.createBlockchainProperties(
        logger,
        web3,
        blockchainSectionConfFile.marketContractLookupAddress,
    );
    const originConf = await  EwOrigin.createBlockchainProperties(
        logger,
        web3,
        blockchainSectionConfFile.originContractLookupAddress,
    );
    marketConf.certificateLogicInstance = originConf.certificateLogicInstance;
    marketConf.activeUser = matcherAccount;

    return {

        blockchainProperties: marketConf,
        logger,
        offChainDataSource: {
            baseUrl: blockchainSectionConfFile.offChainDataSourceUrl,
        },
    };

};

export const initEventHandling = async (
    controller: Controller,
    conf: EwGeneral.Configuration.Entity,
) => {
    const currentBlockNumber = await conf.blockchainProperties.web3.eth.getBlockNumber();
    const certificateContractEventHandler = new EwGeneral.ContractEventHandler(
        conf.blockchainProperties.certificateLogicInstance,
        currentBlockNumber,
    );

    certificateContractEventHandler.onEvent('LogCreatedCertificate' , async (event: any) => {

        logger.verbose('Event: LogCreatedCertificate certificate #' + event.returnValues._certificateId);
        const newCertificate = await new EwOrigin.Certificate.Entity(
            event.returnValues._certificateId,
            conf,
        ).sync();

        await controller.matchTrigger(newCertificate);

    });

    // certificateContractEventHandler.onEvent('LogCertificateOwnerChanged' , async (event) => {
    //
    //     if (matcherAddress === event.returnValues._oldEscrow && matcherAddress !== event.returnValues._newEscrow) {
    //         console.log('\n* Event: LogCertificateOwnerChanged certificate escrow changed certificate id: ' + event.returnValues._certificateId);
    //
    //         // cobntroller.removeCertificate(parseInt(event.returnValues._certificateId, 10))
    //     }
    //
    // });

    const marketContractEventHandler = new EwGeneral.ContractEventHandler(conf.blockchainProperties.marketLogicInstance, currentBlockNumber);

    marketContractEventHandler.onEvent('createdNewDemand', async (event) => {
        console.log('\n* Event: createdNewDemand demand: ' + event.returnValues._demandId);
        const newDemand = await new EwMarket.Demand.Entity(event.returnValues._demandId, conf).sync();
        await controller.registerDemand(newDemand);
        // matchingManager.matchDemandWithCertificatesHoldInTrust(newDemand)

    });

    marketContractEventHandler.onEvent('createdNewSupply', async (event) => {
        console.log("\n* Event: createdNewSupply supply: " + event.returnValues._supplyId);
        const newSupply = await new EwMarket.Supply.Entity(event.returnValues._supplyId, conf).sync();
        await controller.registerSupply(newSupply)
    })

    marketContractEventHandler.onEvent("LogAgreementFullySigned", async (event) => {
        console.log('\n* Event: LogAgreementFullySigned - (Agreement, Demand, Supply) ID: (' +
            event.returnValues._agreementId + ", " +
            event.returnValues._demandId + ", " +
            event.returnValues._supplyId + ")"
        )

        const newAgreement = await new EwMarket.Agreement.Entity(event.returnValues._agreementId, conf).sync()
        await controller.registerAgreement(newAgreement);
    });

    // demandContractEventHandler.onEvent('LogDemandExpired', async (event) => {
    //     console.log('\n* Event: LogDemandExpired demand: ' + event.returnValues._demandId);
    //     controller.removeDemand(parseInt(event.returnValues._demandId, 10));
    //
    // });

    const assetContractEventHandler = new EwGeneral.ContractEventHandler(conf.blockchainProperties.producingAssetLogicInstance, currentBlockNumber);

    // assetContractEventHandler.onEvent('LogNewMeterRead', (event) =>
    //     controller.match()
    // )

    assetContractEventHandler.onEvent('LogAssetFullyInitialized', async (event) => {
        console.log('\n* Event: LogAssetFullyInitialized asset: ' + event.returnValues._assetId);
        const newAsset = await new EwAsset.ProducingAsset.Entity(event.returnValues._assetId, conf).sync();
        await controller.registerProducingAsset(newAsset);

    });

    assetContractEventHandler.onEvent('LogAssetSetActive' , async (event) => {
        console.log('\n* Event: LogAssetSetActive  asset: ' + event.returnValues._assetId);

        const asset = await new EwAsset.ProducingAsset.Entity(event.returnValues._assetId, conf).sync();
        await controller.registerProducingAsset(asset);

    });

    assetContractEventHandler.onEvent('LogAssetSetInactive' , async (event) => {
        console.log('\n* Event: LogAssetSetInactive asset: ' + event.returnValues._assetId);

        await controller.removeProducingAsset(event.returnValues._assetId);

    });

    const consumingAssetContractEventHandler = new EwGeneral.ContractEventHandler(conf.blockchainProperties.consumingAssetLogicInstance, currentBlockNumber);

    // consumingAssetContractEventHandler.onEvent('LogNewMeterRead', async (event) => {
    //     console.log('\n* Event: LogNewMeterRead consuming asset: ' + event.returnValues._assetId);
    //     const asset = await controller.createOrRefreshConsumingAsset(event.returnValues._assetId);
    //     console.log('*> Meter read: '  + asset.lastSmartMeterReadWh + ' Wh');
    //
    // });

    consumingAssetContractEventHandler.onEvent('LogAssetFullyInitialized', async (event) => {
        console.log('\n* Event: LogAssetFullyInitialized consuming asset: ' + event.returnValues._assetId);
        const newAsset = await new EwAsset.ConsumingAsset.Entity(event.returnValues._assetId , conf).sync();
        await controller.registerConsumingAsset(newAsset);

    });

    consumingAssetContractEventHandler.onEvent('LogAssetSetActive' , async (event) => {
        console.log('\n* Event: LogAssetSetActive consuming asset: ' + event.returnValues._assetId);

        const asset = await new EwAsset.ConsumingAsset.Entity(event.returnValues._assetId, conf).sync();
        await controller.registerConsumingAsset(asset);

    });

    consumingAssetContractEventHandler.onEvent('LogAssetSetInactive' , async (event) => {
        console.log('\n* Event: LogAssetSetInactive consuming asset: ' + event.returnValues._assetId);

        await controller.removeConsumingAsset(event.returnValues._assetId);

    });

    const eventHandlerManager = new EwGeneral.EventHandlerManager(4000, conf);
    eventHandlerManager.registerEventHandler(consumingAssetContractEventHandler);
    eventHandlerManager.registerEventHandler(marketContractEventHandler);
    eventHandlerManager.registerEventHandler(assetContractEventHandler);
    eventHandlerManager.registerEventHandler(certificateContractEventHandler);
    eventHandlerManager.start();
};
