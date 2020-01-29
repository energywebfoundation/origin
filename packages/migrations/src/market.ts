import * as fs from 'fs';
import Web3 from 'web3';

import * as Market from '@energyweb/market';
import { Configuration, TimeFrame, Compliance } from '@energyweb/utils-general';
import { User, UserLogic, Role, buildRights } from '@energyweb/user-registry';
import { DeviceLogic } from '@energyweb/device-registry';
import { CertificateLogic } from '@energyweb/origin';
import { Demand, MarketLogic, MarketUser } from '@energyweb/market';
import { OffChainDataSource } from '@energyweb/origin-backend-client';
import { DemandPostData } from '@energyweb/origin-backend-core';

import { certificateDemo } from './certificate';
import { logger } from './Logger';
import { DeployedContractAddresses } from './deployEmpty';

export const marketDemo = async (
    demoConfigPath: string,
    contractConfig: DeployedContractAddresses
) => {
    const startTime = Date.now();

    const web3: Web3 = new Web3(process.env.WEB3);
    const deployKey: string = process.env.DEPLOY_KEY;

    const demoConfig = JSON.parse(
        fs.readFileSync(demoConfigPath ?? './config/demo-config.json', 'utf8').toString()
    );

    const adminPK = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;

    const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPK);

    // create logic instances
    const userLogic = new UserLogic(web3, contractConfig.userLogic);
    const deviceProducingRegistryLogic = new DeviceLogic(web3, contractConfig.deviceLogic);
    const certificateLogic = new CertificateLogic(web3, contractConfig.certificateLogic);
    const marketLogic = new MarketLogic(web3, contractConfig.marketLogic);

    const baseUrl = `${process.env.BACKEND_URL}/api`;

    const offChainDataSource = new OffChainDataSource(baseUrl);

    const conf: Configuration.Entity = {
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
        offChainDataSource,
        logger
    };

    const currencies = await offChainDataSource.configurationClient.get('Currency');

    const userPropsOnChain: User.IUserOnChainProperties = {
        propertiesDocumentHash: null,
        url: null,
        id: adminAccount.address,
        active: true,
        roles: buildRights([Role.UserAdmin, Role.DeviceAdmin])
    };

    const userPropsOffChain: MarketUser.IMarketUserOffChainProperties = {
        notifications: false,
        autoPublish: {
            enabled: false,
            priceInCents: 150,
            currency: currencies[0]
        }
    };

    await MarketUser.createMarketUser(
        userPropsOnChain,
        userPropsOffChain,
        conf,
        {
            email: 'admin@example.com',
            firstName: 'n',
            lastName: 'n',
            password: 'test',
            telephone: '1',
            title: 'Mr'
        },
        adminAccount.privateKey,
        {
            address: adminAccount.address,
            privateKey: adminAccount.privateKey
        }
    );

    const marketLogicMatcherRole: User.IUserOnChainProperties = {
        propertiesDocumentHash: null,
        url: null,
        id: contractConfig.marketLogic,
        active: true,
        roles: buildRights([Role.Matcher])
    };

    await MarketUser.createMarketUser(marketLogicMatcherRole, userPropsOffChain, conf);

    const actionsArray = demoConfig.flow;

    const erc20TestAddress = await Market.Contracts.deployERC20TestToken(
        conf.blockchainProperties.web3,
        adminAccount.address,
        adminPK
    );

    const token = new Market.Contracts.Erc20TestToken(
        conf.blockchainProperties.web3,
        erc20TestAddress
    );
    const symbol = await token.web3Contract.methods.symbol().call();

    conf.logger.info(`ERC20 TOKEN - ${symbol}: ${erc20TestAddress}`);

    const complianceRegistry = await conf.offChainDataSource.configurationClient.get('Compliance');

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
                        `Could not transfer ${action.data.amount} ${tokenSymbol} tokens to ${action.data.address}\n${e}`
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

                const demandOffChainProps: DemandPostData = {
                    owner: action.data.trader,
                    timeFrame: TimeFrame[action.data.timeframe as keyof typeof TimeFrame],
                    maxPriceInCentsPerMwh: action.data.maxPriceInCentsPerMwh,
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
                    const demand = await Demand.createDemand(demandOffChainProps, conf);
                    delete demand.configuration;
                    conf.logger.info(`Demand Created, ID: ${demand.id}`);
                } catch (e) {
                    conf.logger.error(`Demand could not be created\n${e}`);
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
