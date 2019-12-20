import * as fs from 'fs';
import Web3 from 'web3';

import * as Market from '@energyweb/market';
import { Configuration, TimeFrame, Compliance } from '@energyweb/utils-general';
import { User, UserLogic, Role, buildRights } from '@energyweb/user-registry';
import { DeviceLogic } from '@energyweb/device-registry';
import { CertificateLogic } from '@energyweb/origin';
import { Demand, Supply, Agreement, MarketLogic, MarketUser } from '@energyweb/market';
import { OffChainDataClient, ConfigurationClient } from '@energyweb/origin-backend-client';

import { certificateDemo } from './certificate';
import { logger } from './Logger';
import { DeployedContractAddresses } from './deployEmpty';

export const marketDemo = async (demoConfigPath: string, contractConfig: DeployedContractAddresses) => {
    const startTime = Date.now();

    const web3: Web3 = new Web3(process.env.WEB3);
    const deployKey: string = process.env.DEPLOY_KEY;

    const demoConfig = JSON.parse(fs.readFileSync(demoConfigPath ?? './config/demo-config.json', 'utf8').toString());

    const adminPK = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;

    const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPK);

    // create logic instances
    const userLogic = new UserLogic(web3, contractConfig.userLogic);
    const deviceProducingRegistryLogic = new DeviceLogic(web3, contractConfig.deviceLogic);
    const certificateLogic = new CertificateLogic(web3, contractConfig.certificateLogic);
    const marketLogic = new MarketLogic(web3, contractConfig.marketLogic);

    // blockchain configuration
    let conf: Configuration.Entity;

    conf = {
        blockchainProperties: {
            activeUser: {
                address: adminAccount.address,
                privateKey: adminPK
            },
            deviceLogicInstance: deviceProducingRegistryLogic,
            certificateLogicInstance: certificateLogic,
            userLogicInstance: userLogic,
            marketLogicInstance: marketLogic,
            web3
        },
        offChainDataSource: {
            baseUrl: `${process.env.BACKEND_URL}/api`,
            client: new OffChainDataClient(),
            configurationClient: new ConfigurationClient()
        },
        logger
    };

    const userPropsOnChain: User.IUserOnChainProperties = {
        propertiesDocumentHash: null,
        url: null,
        id: adminAccount.address,
        active: true,
        roles: buildRights([Role.UserAdmin, Role.DeviceAdmin]),
        organization: 'admin'
    };

    const userPropsOffChain: MarketUser.IMarketUserOffChainProperties = {
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

    await MarketUser.createMarketUser(userPropsOnChain, userPropsOffChain, conf);

    const marketLogicMatcherRole: User.IUserOnChainProperties = {
        propertiesDocumentHash: null,
        url: null,
        id: contractConfig.marketLogic,
        active: true,
        roles: buildRights([Role.Matcher]),
        organization: 'admin'
    };

    const marketLogicMatcherRoleOffChain: MarketUser.IMarketUserOffChainProperties = {
        firstName: 'MarketMatcher',
        surname: 'User',
        email: 'admin@example.com',
        street: '',
        number: '',
        zip: '',
        city: '',
        country: '',
        state: ''
    };

    await MarketUser.createMarketUser(marketLogicMatcherRole, marketLogicMatcherRoleOffChain, conf);

    const actionsArray = demoConfig.flow;

    const erc20TestAddress = await Market.Contracts.deployERC20TestToken(
        conf.blockchainProperties.web3,
        adminAccount.address,
        adminPK
    );

    const token = new Market.Contracts.Erc20TestToken(conf.blockchainProperties.web3, erc20TestAddress);
    const symbol = await token.web3Contract.methods.symbol().call();

    conf.logger.info(`ERC20 TOKEN - ${symbol}: ${erc20TestAddress}`);

    const currencies = await conf.offChainDataSource.configurationClient.get(conf.offChainDataSource.baseUrl, 'Currency');
    const complianceRegistry = await conf.offChainDataSource.configurationClient.get(conf.offChainDataSource.baseUrl, 'Compliance');

    for (const action of actionsArray) {
        switch (action.type) {
            case 'SEND_ERC20_TOKENS_TO':
                console.log('-----------------------------------------------------------');

                const erc20token = new Market.Contracts.Erc20TestToken(
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

                if (!Array.isArray(action.data.devicetype)) {
                    throw new Error('Demand devicetype has to be string[]');
                }

                if (!currencies.includes(action.data.currency)) {
                    conf.logger.error('Demand could not be created\nUnknown currency');
                    break;
                }

                const demandOffchainProps: Demand.IDemandOffChainProperties = {
                    timeFrame: TimeFrame[action.data.timeframe as keyof typeof TimeFrame],
                    maxPricePerMwh: action.data.maxPricePerMwh,
                    currency: action.data.currency,
                    location: [action.data.location],
                    deviceType: action.data.devicetype,
                    minCO2Offset: action.data.minCO2Offset,
                    otherGreenAttributes: action.data.otherGreenAttributes,
                    typeOfPublicSupport: action.data.typeOfPublicSupport,
                    energyPerTimeFrame: action.data.energyPerTimeFrame,
                    registryCompliance: complianceRegistry,
                    startTime: action.data.startTime,
                    endTime: action.data.endTime,
                    automaticMatching: true
                };

                try {
                    const demand = await Demand.createDemand(
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
                    address: action.data.deviceOwner,
                    privateKey: action.data.deviceOwnerPK
                };

                const supplyOffChainProperties: Supply.ISupplyOffChainProperties = {
                    price: action.data.price,
                    currency: action.data.currency,
                    availableWh: action.data.availableWh,
                    timeFrame: TimeFrame[action.data.timeframe as keyof typeof TimeFrame]
                };

                const supplyProps: Supply.ISupplyOnChainProperties = {
                    url: '',
                    propertiesDocumentHash: '',
                    deviceId: action.data.deviceId
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
                    currency: action.data.currency,
                    period: action.data.period,
                    timeFrame: TimeFrame[action.data.timeframe as keyof typeof TimeFrame]
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
    conf.logger.info(`Total Time: ${(Date.now() - startTime) / 1000} seconds`);
};
