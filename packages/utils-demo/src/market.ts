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

import { deployERC20TestToken, Erc20TestToken } from 'ew-erc-test-contracts';
import {
    Configuration,
    TimeFrame,
    Compliance,
    Currency
} from '@energyweb/utils-general';
import { User, UserLogic, Role, buildRights } from '@energyweb/user-registry';
import {
    AssetProducingRegistryLogic,
    AssetConsumingRegistryLogic
} from '@energyweb/asset-registry';
import { CertificateLogic } from '@energyweb/origin';
import { Demand, Supply, Agreement, MarketLogic } from '@energyweb/market';

import { CONFIG } from './config';
import { certificateDemo } from './certificate';
import { logger } from './Logger';

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

    // initialize variables for storing timeframe and currency
    let timeFrame;
    let currency;

    // blockchain configuration
    let conf: Configuration.Entity;

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

    const userPropsOnChain: User.IUserOnChainProperties = {
        propertiesDocumentHash: null,
        url: null,
        id: adminAccount.address,
        active: true,
        roles: buildRights([Role.UserAdmin, Role.AssetAdmin]),
        organization: 'admin'
    };

    const userPropsOffChain: User.IUserOffChainProperties = {
        firstName: 'Admin',
        surname: 'User',
        email: 'admin@example.com',
        street: '',
        number: '',
        zip: '',
        city: '',
        country: '',
        state: ''
    };

    await User.createUser(userPropsOnChain, userPropsOffChain, conf);

    const actionsArray = demoConfig.flow;

    const erc20TestAddress = (await deployERC20TestToken(
        conf.blockchainProperties.web3,
        adminAccount.address,
        adminPK
    )).contractAddress;

    const token = new Erc20TestToken(conf.blockchainProperties.web3, erc20TestAddress);
    const symbol = await token.web3Contract.methods.symbol().call();

    conf.logger.info(`ERC20 TOKEN - ${symbol}: ${erc20TestAddress}`);

    for (const action of actionsArray) {
        switch (action.type) {
            case 'SEND_ERC20_TOKENS_TO':
                console.log('-----------------------------------------------------------');

                const erc20token = new Erc20TestToken(
                    conf.blockchainProperties.web3,
                    erc20TestAddress
                );

                const tokenSymbol = await erc20token.symbol();

                try {
                    await erc20token.transfer(action.data.address, action.data.amount, {
                        privateKey: adminPK
                    });
                    conf.logger.info(
                        `Transferred ${action.data.amount} of ${tokenSymbol} tokens to ${action.data.address}`
                    );
                } catch (e) {
                    conf.logger.error(
                        `Could not transfer ${action.data.amount} ${tokenSymbol} tokens to ${action.data.address}\n` +
                            e
                    );
                }

                console.log('-----------------------------------------------------------\n');
                break;

            case 'CREATE_DEMAND':
                console.log('-----------------------------------------------------------');

                conf.blockchainProperties.activeUser = {
                    address: action.data.trader,
                    privateKey: action.data.traderPK
                };

                if (!Array.isArray(action.data.assettype)) {
                    throw new Error("Demand assettype has to be string[]")
                }
                const assetTypeConfig = action.data.assettype;
                const assetCompliance =
                    Compliance[action.data.registryCompliance as keyof typeof Compliance];
                timeFrame = TimeFrame[action.data.timeframe as keyof typeof TimeFrame];
                currency = Currency[action.data.currency as keyof typeof Currency];

                const demandOffchainProps: Demand.IDemandOffChainProperties = {
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

                const demandProps: Demand.IDemandOnChainProperties = {
                    url: '',
                    propertiesDocumentHash: '',
                    demandOwner: action.data.trader,
                    status: Demand.DemandStatus.ACTIVE
                };

                try {
                    const demand = await Demand.createDemand(
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

                timeFrame = TimeFrame[action.data.timeframe as keyof typeof TimeFrame];
                currency = Currency[action.data.currency as keyof typeof Currency];

                const supplyOffChainProperties: Supply.ISupplyOffchainProperties = {
                    price: action.data.price,
                    currency,
                    availableWh: action.data.availableWh,
                    timeframe: timeFrame
                };

                const supplyProps: Supply.ISupplyOnChainProperties = {
                    url: '',
                    propertiesDocumentHash: '',
                    assetId: action.data.assetId
                };

                try {
                    const supply = await Supply.createSupply(
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

                timeFrame = TimeFrame[action.data.timeframe as keyof typeof TimeFrame];
                currency = Currency[action.data.currency as keyof typeof Currency];

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

                const agreementOffchainProps: Agreement.IAgreementOffChainProperties = {
                    start: action.data.startTime,
                    end: action.data.endTime,
                    price: action.data.price,
                    currency,
                    period: action.data.period,
                    timeframe: timeFrame
                };

                const matcherOffchainProps: Agreement.IMatcherOffChainProperties = {
                    currentWh: action.data.currentWh,
                    currentPeriod: action.data.currentPeriod
                };

                const agreementProps: Agreement.IAgreementOnChainProperties = {
                    propertiesDocumentHash: null,
                    url: null,
                    matcherDBURL: null,
                    matcherPropertiesDocumentHash: null,
                    demandId: action.data.demandId,
                    supplyId: action.data.supplyId,
                    allowedMatcher: [action.data.allowedMatcher]
                };

                try {
                    const agreement = await Agreement.createAgreement(
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
                    let agreement: Agreement.Entity = await new Agreement.Entity(
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
                await certificateDemo(passString, conf, adminPK, erc20TestAddress);
        }
    }
    conf.logger.info(`Total Time: ${(Date.now() - startTime) / 1000} seconds`);
};
