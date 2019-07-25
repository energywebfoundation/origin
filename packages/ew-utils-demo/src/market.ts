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
import { certificateDemo } from './certificate';
import { logger } from './Logger';

import * as GeneralLib from 'ew-utils-general-lib';
import * as Market from 'ew-market-lib';

import { UserLogic, Role, buildRights } from 'ew-user-registry-lib';
import {
    AssetProducingRegistryLogic,
    AssetConsumingRegistryLogic
} from 'ew-asset-registry-lib';
import {
    CertificateLogic} from 'ew-origin-lib';
import { MarketLogic } from 'ew-market-lib';
import { CONFIG } from './config';

export const marketDemo = async (demoFile?: string) => {
    const startTime = Date.now();

    const connectionConfig = JSON.parse(
        fs.readFileSync('./connection-config.json', 'utf8').toString()
    );

    let demoConfig;
    if (!demoFile) {
        demoConfig = JSON.parse(fs.readFileSync('./config/demo-config.json', 'utf8').toString());
    } else {
        demoConfig = JSON.parse(demoFile);
    }

    const contractConfig = JSON.parse(
        fs.readFileSync('./config/contractConfig.json', 'utf8').toString()
    );

    const web3 = new Web3(connectionConfig.develop.web3);

    const adminPK = demoConfig.topAdminPrivateKey.startsWith('0x')
        ? demoConfig.topAdminPrivateKey
        : '0x' + demoConfig.topAdminPrivateKey;

    const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPK);

    // create logic instances
    const userLogic = new UserLogic(web3, contractConfig.userLogic);
    const assetProducingRegistryLogic = new AssetProducingRegistryLogic(
        web3,
        contractConfig.assetProducingRegistryLogic
    );
    const assetConsumingRegistryLogic = new AssetConsumingRegistryLogic(
        web3,
        contractConfig.assetConsumingRegistryLogic
    );
    const certificateLogic = new CertificateLogic(web3, contractConfig.certificateLogic);
    const marketLogic = new MarketLogic(web3, contractConfig.marketLogic);

    // set the admin account as an asset admin
    await userLogic.setUser(adminAccount.address, 'admin', { privateKey: adminPK });
    await userLogic.setRoles(adminAccount.address, buildRights([Role.UserAdmin, Role.AssetAdmin]), { privateKey: adminPK });

    // initialize variables for storing timeframe and currency
    let timeFrame;
    let currency;

    // blockchain configuration
    let conf: GeneralLib.Configuration.Entity;

    conf = {
        blockchainProperties: {
            activeUser: {
                address: adminAccount.address,
                privateKey: adminPK
            },
            producingAssetLogicInstance: assetProducingRegistryLogic,
            consumingAssetLogicInstance: assetConsumingRegistryLogic,
            certificateLogicInstance: certificateLogic,
            userLogicInstance: userLogic,
            marketLogicInstance: marketLogic,
            web3
        },
        offChainDataSource: {
            baseUrl: CONFIG.API_BASE_URL
        },
        logger
    };

    const actionsArray = demoConfig.flow;

    for (const action of actionsArray) {
        switch (action.type) {
            case 'CREATE_DEMAND':
                console.log('-----------------------------------------------------------');

                conf.blockchainProperties.activeUser = {
                    address: action.data.trader,
                    privateKey: action.data.traderPK
                };

                let assetTypeConfig;

                switch (action.data.assettype) {
                    case 'Wind':
                        assetTypeConfig = GeneralLib.AssetType.Wind;
                        break;
                    case 'Solar':
                        assetTypeConfig = GeneralLib.AssetType.Solar;
                        break;
                    case 'RunRiverHydro':
                        assetTypeConfig = GeneralLib.AssetType.RunRiverHydro;
                        break;
                    case 'BiomassGas':
                        assetTypeConfig = GeneralLib.AssetType.BiomassGas;
                }

                let assetCompliance;

                switch (action.data.registryCompliance) {
                    case 'IREC':
                        assetCompliance = GeneralLib.Compliance.IREC;
                        break;
                    case 'EEC':
                        assetCompliance = GeneralLib.Compliance.EEC;
                        break;
                    case 'TIGR':
                        assetCompliance = GeneralLib.Compliance.TIGR;
                        break;
                    default:
                        assetCompliance = GeneralLib.Compliance.none;
                        break;
                }

                switch (action.data.timeframe) {
                    case 'yearly':
                        timeFrame = GeneralLib.TimeFrame.yearly;
                        break;
                    case 'monthly':
                        timeFrame = GeneralLib.TimeFrame.monthly;
                        break;
                    case 'daily':
                        timeFrame = GeneralLib.TimeFrame.daily;
                        break;
                    case 'hourly':
                        timeFrame = GeneralLib.TimeFrame.hourly;
                        break;
                }

                switch (action.data.currency) {
                    case 'EUR':
                        currency = GeneralLib.Currency.EUR;
                        break;
                    case 'USD':
                        currency = GeneralLib.Currency.USD;
                        break;
                    case 'SGD':
                        currency = GeneralLib.Currency.SGD;
                        break;
                    case 'THB':
                        currency = GeneralLib.Currency.THB;
                        break;
                }

                const demandOffchainProps: Market.Demand.IDemandOffChainProperties = {
                    timeframe: timeFrame,
                    maxPricePerMwh: action.data.maxPricePerMwh,
                    currency,
                    productingAsset: action.data.producingAsset,
                    consumingAsset: action.data.consumingAsset,
                    locationCountry: action.data.country,
                    locationRegion: action.data.region,
                    assettype: assetTypeConfig,
                    minCO2Offset: action.data.minCO2Offset,
                    otherGreenAttributes: action.data.otherGreenAttributes,
                    typeOfPublicSupport: action.data.typeOfPublicSupport,
                    targetWhPerPeriod: action.data.targetWhPerPeriod,
                    registryCompliance: assetCompliance,
                    startTime: action.data.startTime,
                    endTime: action.data.endTime
                };

                const demandProps: Market.Demand.IDemandOnChainProperties = {
                    url: '',
                    propertiesDocumentHash: '',
                    demandOwner: action.data.trader
                };

                try {
                    const demand = await Market.Demand.createDemand(
                        demandProps,
                        demandOffchainProps,
                        conf
                    );
                    delete demand.proofs;
                    delete demand.configuration;
                    conf.logger.info('Demand Created, ID: ' + demand.id);
                } catch (e) {
                    conf.logger.error('Demand could not be created\n' + e);
                }

                console.log('-----------------------------------------------------------\n');

                break;
            case 'CREATE_SUPPLY':
                console.log('-----------------------------------------------------------');

                conf.blockchainProperties.activeUser = {
                    address: action.data.assetOwner,
                    privateKey: action.data.assetOwnerPK
                };

                switch (action.data.timeframe) {
                    case 'yearly':
                        timeFrame = GeneralLib.TimeFrame.yearly;
                        break;
                    case 'monthly':
                        timeFrame = GeneralLib.TimeFrame.monthly;
                        break;
                    case 'daily':
                        timeFrame = GeneralLib.TimeFrame.daily;
                        break;
                    case 'hourly':
                        timeFrame = GeneralLib.TimeFrame.hourly;
                        break;
                }

                switch (action.data.currency) {
                    case 'EUR':
                        currency = GeneralLib.Currency.EUR;
                        break;
                    case 'USD':
                        currency = GeneralLib.Currency.USD;
                        break;
                    case 'SGD':
                        currency = GeneralLib.Currency.SGD;
                        break;
                    case 'THB':
                        currency = GeneralLib.Currency.THB;
                        break;
                }

                const supplyOffChainProperties: Market.Supply.ISupplyOffchainProperties = {
                    price: action.data.price,
                    currency,
                    availableWh: action.data.availableWh,
                    timeframe: timeFrame
                };

                const supplyProps: Market.Supply.ISupplyOnChainProperties = {
                    url: '',
                    propertiesDocumentHash: '',
                    assetId: action.data.assetId
                };

                try {
                    const supply = await Market.Supply.createSupply(
                        supplyProps,
                        supplyOffChainProperties,
                        conf
                    );
                    delete supply.proofs;
                    delete supply.configuration;
                    conf.logger.info('Onboarded Supply ID: ' + supply.id);
                } catch (e) {
                    conf.logger.error('Could not onboard a supply\n' + e);
                }

                console.log('-----------------------------------------------------------\n');

                break;

            case 'MAKE_AGREEMENT':
                console.log('-----------------------------------------------------------');

                conf.blockchainProperties.activeUser = {
                    address: action.data.creator,
                    privateKey: action.data.creatorPK
                };

                switch (action.data.timeframe) {
                    case 'yearly':
                        timeFrame = GeneralLib.TimeFrame.yearly;
                        break;
                    case 'monthly':
                        timeFrame = GeneralLib.TimeFrame.monthly;
                        break;
                    case 'daily':
                        timeFrame = GeneralLib.TimeFrame.daily;
                        break;
                    case 'hourly':
                        timeFrame = GeneralLib.TimeFrame.hourly;
                        break;
                }

                switch (action.data.currency) {
                    case 'EUR':
                        currency = GeneralLib.Currency.EUR;
                        break;
                    case 'USD':
                        currency = GeneralLib.Currency.USD;
                        break;
                    case 'SGD':
                        currency = GeneralLib.Currency.SGD;
                        break;
                    case 'THB':
                        currency = GeneralLib.Currency.THB;
                        break;
                }

                if (action.data.startTime === -1) {
                    action.data.startTime = Math.floor(Date.now() / 1000);
                    action.data.endTime += action.data.startTime;
                    logger.verbose(
                        'Agreement starts at ' +
                            action.data.startTime +
                            ' and ends at ' +
                            action.data.endTime
                    );
                }

                const agreementOffchainProps: Market.Agreement.IAgreementOffChainProperties = {
                    start: action.data.startTime,
                    end: action.data.endTime,
                    price: action.data.price,
                    currency,
                    period: action.data.period,
                    timeframe: timeFrame
                };

                const matcherOffchainProps: Market.Agreement.IMatcherOffChainProperties = {
                    currentWh: action.data.currentWh,
                    currentPeriod: action.data.currentPeriod
                };

                const agreementProps: Market.Agreement.IAgreementOnChainProperties = {
                    propertiesDocumentHash: null,
                    url: null,
                    matcherDBURL: null,
                    matcherPropertiesDocumentHash: null,
                    demandId: action.data.demandId,
                    supplyId: action.data.supplyId,
                    allowedMatcher: [action.data.allowedMatcher]
                };

                try {
                    const agreement = await Market.Agreement.createAgreement(
                        agreementProps,
                        agreementOffchainProps,
                        matcherOffchainProps,
                        conf
                    );
                    delete agreement.proofs;
                    delete agreement.configuration;
                    delete agreement.propertiesDocumentHash;
                    delete agreement.matcherPropertiesDocumentHash;
                    if (agreement.approvedBySupplyOwner && agreement.approvedByDemandOwner) {
                        conf.logger.info('Agreement Confirmed');
                    } else if (!agreement.approvedByDemandOwner) {
                        conf.logger.info('Demand Owner did not approve yet');
                    } else if (!agreement.approvedBySupplyOwner) {
                        conf.logger.info('Supply Owner did not approve yet');
                    }
                } catch (e) {
                    conf.logger.error('Error making an agreement\n' + e);
                }

                console.log('-----------------------------------------------------------\n');
                break;
            case 'APPROVE_AGREEMENT':
                console.log('-----------------------------------------------------------');

                conf.blockchainProperties.activeUser = {
                    address: action.data.agree,
                    privateKey: action.data.agreePK
                };

                try {
                    let agreement: Market.Agreement.Entity = await new Market.Agreement.Entity(
                        action.data.agreementId.toString(),
                        conf
                    ).sync();
                    await agreement.approveAgreementSupply();
                    agreement = await agreement.sync();
                    if (agreement.approvedBySupplyOwner && agreement.approvedByDemandOwner) {
                        conf.logger.info('Agreement Confirmed');
                    } else if (!agreement.approvedByDemandOwner) {
                        conf.logger.info('Demand Owner did not approve yet');
                    } else if (!agreement.approvedBySupplyOwner) {
                        conf.logger.info('Supply Owner did not approve yet');
                    }
                } catch (e) {
                    conf.logger.error('Could not approve agreement\n' + e);
                }

                console.log('-----------------------------------------------------------\n');
                break;
            default:
                const passString = JSON.stringify(action);
                await certificateDemo(passString, conf, adminPK);
        }
    }
    conf.logger.info('Total Time: ' + (Date.now() - startTime) / 1000 + ' seconds');
};
