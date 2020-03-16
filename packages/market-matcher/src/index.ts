import { createBlockchainProperties as marketCreateBlockchainProperties } from '@energyweb/market';
import {
    CertificateMatcher,
    CertificateService,
    DemandMatcher,
    TimeTrigger
} from '@energyweb/market-matcher-core';
import { IOffChainDataSource } from '@energyweb/origin-backend-client';
import { Configuration, DeviceTypeService } from '@energyweb/utils-general';
import Web3 from 'web3';

import { Role } from '@energyweb/user-registry';
import { EntityFetcher } from './EntityFetcher';
import { EntityStore } from './EntityStore';
import { logger } from './Logger';
import { Matcher } from './Matcher';
import { LowestPriceStrategy } from './strategy/LowestPriceStrategy';

export interface IMatcherConfig {
    web3Url: string;
    marketLogicAddress: string;
    matcherAccount: Configuration.EthAccount;
    offChainDataSource: IOffChainDataSource;
    matcherInterval: number;
}

const createBlockchainConfig = async (
    matcherConfig: IMatcherConfig
): Promise<Configuration.Entity> => {
    const web3 = new Web3(matcherConfig.web3Url);

    const blockchainProperties = await marketCreateBlockchainProperties(
        web3,
        matcherConfig.marketLogicAddress
    );
    blockchainProperties.activeUser = matcherConfig.matcherAccount;

    return {
        blockchainProperties,
        logger,
        offChainDataSource: matcherConfig.offChainDataSource,
        deviceTypeService: new DeviceTypeService(
            (await matcherConfig.offChainDataSource.configurationClient.get()).deviceTypes
        )
    };
};

const testMatcherAccount = async (config: Configuration.Entity) => {
    const { userLogicInstance, web3, activeUser } = config.blockchainProperties;

    const { address } = web3.eth.accounts.privateKeyToAccount(activeUser.privateKey);
    const hasMatcherRole = await userLogicInstance.isRole(Role.Matcher, address);
    const balance = web3.utils.fromWei(await web3.eth.getBalance(address));

    if (!hasMatcherRole) {
        logger.error(`Matcher account: ${address} does not have Matcher role set in User Registry`);
        throw new Error('Missing Matcher role');
    }
    if (parseFloat(balance) < 0.5) {
        logger.error(
            `Matcher account: ${address} should have at least 0.5EWT tokens. Current balance is ${parseFloat(
                balance
            )}EWT`
        );
        throw new Error('Insufficient balance');
    }
    logger.info(`Matcher account: ${address} - Matcher role: OK`);
    logger.info(`Matcher account: ${address} - Matcher balance ${balance}EWT: OK`);
};

export async function startMatcher(matcherConfig: IMatcherConfig) {
    logger.info('Matcher application is starting.');

    if (!matcherConfig) {
        throw new Error('No config specified');
    }

    try {
        const config = await createBlockchainConfig(matcherConfig);

        await testMatcherAccount(config);

        const entityFetcher = new EntityFetcher(config);
        const entityStore = new EntityStore(config, logger, entityFetcher);

        const certificationService = new CertificateService(config, logger);

        const strategy = new LowestPriceStrategy();
        const certificateMatcher = new CertificateMatcher(
            config,
            entityStore,
            certificationService,
            strategy,
            logger
        );
        const demandMatcher = new DemandMatcher(
            config,
            entityStore,
            certificationService,
            strategy,
            logger
        );

        const timeTrigger = new TimeTrigger(entityStore, logger, matcherConfig.matcherInterval);
        const matcher = new Matcher(
            certificateMatcher,
            demandMatcher,
            entityStore,
            timeTrigger,
            logger
        );

        await matcher.init();
    } catch (e) {
        logger.error(e);
    }

    logger.info('Matcher application started.');
}
