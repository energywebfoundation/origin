import * as fs from 'fs';
import Web3 from 'web3';
import dotenv from 'dotenv';
import moment from 'moment';

import {
    AssetConsumingRegistryLogic,
    AssetProducingRegistryLogic
} from '@energyweb/asset-registry';
import { Agreement, Demand, MarketLogic, Supply } from '@energyweb/market';
import { CertificateLogic } from '@energyweb/origin';
import { buildRights, Role, User, UserLogic } from '@energyweb/user-registry';
import { Compliance, Configuration, Currency, TimeFrame } from '@energyweb/utils-general';
import { deployERC20TestToken } from '@energyweb/erc-test-contracts';

import { certificateDemo } from './certificate';
import { logger } from './Logger';

export const marketDemo = async (demoFile?: string) => {
    const startTime = moment().unix();

    const web3: Web3 = new Web3(process.env.WEB3);
    const deployKey: string = process.env.DEPLOY_KEY;

    let demoConfig;
    if (!demoFile) {
        demoConfig = JSON.parse(fs.readFileSync('./config/demo-config.json', 'utf8').toString());
    } else {
        demoConfig = JSON.parse(demoFile);
    }

    const contractConfig = JSON.parse(
        fs.readFileSync('./config/contractConfig.json', 'utf8').toString()
    );

    const adminPK = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;
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
            baseUrl: `${process.env.BACKEND_URL}/api`
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
        state: '',
        notifications: true
    };

    await User.createUser(userPropsOnChain, userPropsOffChain, conf);

    const actionsArray = demoConfig.flow;

    const erc20TestAddress = (await deployERC20TestToken(
        conf.blockchainProperties.web3,
        adminAccount.address,
        adminPK
    )).contractAddress;

    conf.logger.info('ERC20 TOKEN: ' + erc20TestAddress);

    for (const action of actionsArray) {
        switch (action.type) {
            case 'CREATE_DEMAND':
                console.log('-----------------------------------------------------------');

                conf.blockchainProperties.activeUser = {
                    address: action.data.trader,
                    privateKey: action.data.traderPK
                };
                if (!Array.isArray(action.data.assettype)) {
                    throw new Error('Demand assettype has to be string[]');
                }
                const assetTypeConfig = action.data.assettype;
                const assetCompliance =
                    Compliance[action.data.registryCompliance as keyof typeof Compliance];
                timeFrame = TimeFrame[action.data.timeframe as keyof typeof TimeFrame];
                currency = Currency[action.data.currency as keyof typeof Currency];

                const demandOffchainProps: Demand.IDemandOffChainProperties = {
                    timeFrame: timeFrame,
                    maxPricePerMwh: action.data.maxPricePerMwh,
                    currency,
                    location: [action.data.location],
                    assetType: assetTypeConfig,
                    minCO2Offset: action.data.minCO2Offset,
                    otherGreenAttributes: action.data.otherGreenAttributes,
                    typeOfPublicSupport: action.data.typeOfPublicSupport,
                    energyPerTimeFrame: action.data.energyPerTimeFrame,
                    registryCompliance: assetCompliance,
                    startTime: action.data.startTime,
                    endTime: action.data.endTime
                };

                try {
                    const demand = await Demand.createDemand(demandOffchainProps, conf);
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

                const supplyOffChainProperties: Supply.ISupplyOffChainProperties = {
                    price: action.data.price,
                    currency,
                    availableWh: action.data.availableWh,
                    timeFrame: timeFrame
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

                const agreementOffchainProps: Agreement.IAgreementOffChainProperties = {
                    start: action.data.startTime,
                    end: action.data.endTime,
                    price: action.data.price,
                    currency,
                    period: action.data.period,
                    timeFrame: timeFrame
                };

                const agreementProps: Agreement.IAgreementOnChainProperties = {
                    propertiesDocumentHash: null,
                    url: null,
                    demandId: action.data.demandId,
                    supplyId: action.data.supplyId
                };

                try {
                    const agreement = await Agreement.createAgreement(
                        agreementProps,
                        agreementOffchainProps,
                        conf
                    );
                    delete agreement.proofs;
                    delete agreement.configuration;
                    delete agreement.propertiesDocumentHash;
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
    conf.logger.info('Total Time: ' + (moment().unix() - startTime) + ' seconds');
};
