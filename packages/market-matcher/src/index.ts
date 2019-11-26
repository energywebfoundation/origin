import { createBlockchainProperties as marketCreateBlockchainProperties } from '@energyweb/market';
import {
    CertificateMatcher,
    CertificateService,
    DemandMatcher,
    TimeTrigger
} from '@energyweb/market-matcher-core';
import { IOffChainDataClient } from '@energyweb/origin-backend-client';
import { Configuration } from '@energyweb/utils-general';
import Web3 from 'web3';

import { EntityFetcher } from './EntityFetcher';
import { EntityStore } from './EntityStore';
import { logger } from './Logger';
import { Matcher } from './Matcher';
import { LowestPriceStrategy } from './strategy/LowestPriceStrategy';

export interface IMatcherConfig {
    web3Url: string;
    marketLogicAddress: string;
    matcherAccount: Configuration.EthAccount;
    offChainDataSourceUrl: string;
    offChainDataSourceClient: IOffChainDataClient;
    matcherInterval: number;
}

const createBlockchainConf = async (
    matcherConfig: IMatcherConfig
): Promise<Configuration.Entity> => {
    const web3 = new Web3(matcherConfig.web3Url);

    const marketConf = await marketCreateBlockchainProperties(
        web3,
        matcherConfig.marketLogicAddress
    );
    marketConf.activeUser = matcherConfig.matcherAccount;

    return {
        blockchainProperties: marketConf,
        logger,
        offChainDataSource: {
            baseUrl: matcherConfig.offChainDataSourceUrl,
            client: matcherConfig.offChainDataSourceClient
        }
    };
};

export async function startMatcher(matcherConfig: IMatcherConfig) {
    logger.info('Matcher application is starting.');

    if (!matcherConfig) {
        throw new Error('No config specified');
    }

    try {
        const config = await createBlockchainConf(matcherConfig);
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
