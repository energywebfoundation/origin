import 'reflect-metadata';

import { createBlockchainProperties as marketCreateBlockchainProperties } from '@energyweb/market';
import { createBlockchainProperties as issuerCreateBlockchainProperties } from '@energyweb/origin';
import { Configuration } from '@energyweb/utils-general';
import Web3 from 'web3';
import { container } from 'tsyringe';
import * as Winston from 'winston';

import { logger } from './Logger';
import { Matcher } from './Matcher';
import { EntityStore, IEntityStore } from './EntityStore';
import { IStrategy } from './strategy/IStrategy';
import { LowestPriceStrategy } from './strategy/LowestPriceStrategy';
import { CertificateService } from './CertificateService';

export interface IMatcherConfig {
    web3Url: string;
    marketContractLookupAddress: string;
    originContractLookupAddress: string;
    matcherAccount: Configuration.EthAccount;
    offChainDataSourceUrl: string;
}

const createBlockchainConf = async (
    matcherConfig: IMatcherConfig
): Promise<Configuration.Entity> => {
    const web3 = new Web3(matcherConfig.web3Url);
    const marketConf = await marketCreateBlockchainProperties(
        web3,
        matcherConfig.marketContractLookupAddress
    );
    const originConf = await issuerCreateBlockchainProperties(
        web3,
        matcherConfig.originContractLookupAddress
    );
    marketConf.certificateLogicInstance = originConf.certificateLogicInstance;
    marketConf.activeUser = matcherConfig.matcherAccount;

    return {
        blockchainProperties: marketConf,
        logger,
        offChainDataSource: {
            baseUrl: matcherConfig.offChainDataSourceUrl
        }
    };
};

export async function startMatcher(config: IMatcherConfig) {
    logger.info('Matcher application is starting.');

    if (config) {
        try {
            const configEntity = await createBlockchainConf(config);

            container.register<Configuration.Entity>('config', {
                useValue: configEntity
            });
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

            const matcher = container.resolve<Matcher>(Matcher);
            await matcher.init();
        } catch (e) {
            logger.error(e.message);
        }
    } else {
        throw new Error('No config specified');
    }

    logger.info('Matcher application started.');
}

export { MatchableDemand } from './MatchableDemand';
export { MatchableAgreement } from './MatchableAgreement';
