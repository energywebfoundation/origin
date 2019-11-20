import 'reflect-metadata';

import { createBlockchainProperties as marketCreateBlockchainProperties } from '@energyweb/market';
import {
    CertificateMatcher,
    CertificateService,
    DemandMatcher,
    IEntityStore,
    IStrategy,
    ITimeTrigger,
    TimeTrigger
} from '@energyweb/market-matcher-core';
import { IOffChainDataClient } from '@energyweb/origin-backend-client';
import { Configuration } from '@energyweb/utils-general';
import { container } from 'tsyringe';
import Web3 from 'web3';
import * as Winston from 'winston';

import { EntityFetcher, IEntityFetcher } from './EntityFetcher';
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

export async function startMatcher(config: IMatcherConfig) {
    logger.info('Matcher application is starting.');

    if (!config) {
        throw new Error('No config specified');
    }

    try {
        const configEntity = await createBlockchainConf(config);

        container.register<Configuration.Entity>('config', {
            useValue: configEntity
        });
        container.register<IEntityFetcher>('entityFetcher', { useClass: EntityFetcher });
        container.register<IEntityStore>(
            'entityStore',
            { useClass: EntityStore },
            { singleton: true }
        );
        container.register<IStrategy>('strategy', { useClass: LowestPriceStrategy });
        container.register<CertificateService>('certificateService', {
            useClass: CertificateService
        });
        container.register<Winston.Logger>('logger', { useValue: logger });
        container.register<CertificateMatcher>('certificateMatcher', {
            useClass: CertificateMatcher
        });
        container.register<DemandMatcher>('demandMatcher', {
            useClass: DemandMatcher
        });
        container.register<ITimeTrigger>('timeTrigger', { useClass: TimeTrigger });
        container.register('interval', { useValue: config.matcherInterval });

        const matcher = container.resolve<Matcher>(Matcher);
        await matcher.init();
    } catch (e) {
        logger.error(e);
    }

    logger.info('Matcher application started.');
}
