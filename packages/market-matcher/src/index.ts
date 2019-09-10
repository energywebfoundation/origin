import { createBlockchainConf } from './controller/BlockchainConnection';
import { BlockchainModeController } from './controller/BlockchainModeController';
import { Controller } from './controller/Controller';
import { SimulationModeController } from './controller/SimulationModeController';
import { logger } from './Logger';
import * as MatcherLogic from './matcher/MatcherLogic';
import { StrategyBasedMatcher } from './matcher/StrategyBasedMatcher';
import * as SchemaDefs from './matcher/MatcherConfig';
import { LowestPriceStrategy } from './strategy/LowestPriceStrategy';

const METHOD_NOT_IMPLEMENTED = 'Method not implemented.';

const buildController = async (
    dataSource: SchemaDefs.IBlockchainDataSource | SchemaDefs.ISimulationDataSource
): Promise<Controller> => {
    logger.verbose('Data source type is ' + dataSource.type);
    switch (dataSource.type) {
        case SchemaDefs.BlockchainDataSourceType.Blockchain:
            return new BlockchainModeController(
                await createBlockchainConf(dataSource, dataSource.matcherAccount),
                dataSource.matcherAccount.address
            );

        case SchemaDefs.SimulationDataSourceType.Simulation:
            return new SimulationModeController(dataSource);

        default:
            throw new Error('Unknown data source type.');
    }
};

const startMatcher = async (conf: SchemaDefs.IMatcherConfig) => {
    logger.info('Matcher application is starting.');

    if (conf) {
        try {
            const matcher = new StrategyBasedMatcher(new LowestPriceStrategy());
            const controller = await buildController(conf.dataSource);
            matcher.setController(controller);
            controller.setMatcher(matcher);
            controller.start();
        } catch (e) {
            logger.error(e.message);
        }
    } else {
        throw new Error('No config specified');
    }

    logger.info('Matcher application started.');
};

export { MatcherLogic, METHOD_NOT_IMPLEMENTED, startMatcher };
