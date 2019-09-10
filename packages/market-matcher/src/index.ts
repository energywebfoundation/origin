import * as ConfSchema from '../schemas/conf.schema.json';
import { createBlockchainConf } from './controller/BlockchainConnection';
import { BlockchainModeController } from './controller/BlockchainModeController';
import { Controller } from './controller/Controller';
import { SimulationModeController } from './controller/SimulationModeController';
import { logger } from './Logger';
import * as MatcherLogic from './matcher/MatcherLogic';
import { StrategyBasedMatcher } from './matcher/StrategyBasedMatcher';
import * as SchemaDefs from './schema-defs/MatcherConf';
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

const startMatcher = async (conf: SchemaDefs.IMatcherConf) => {
    logger.info('Matcher application started.');

    if (conf) {
        try {
            Controller.validateJson(conf, ConfSchema, 'Config file');
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
};

export { MatcherLogic, METHOD_NOT_IMPLEMENTED, startMatcher };
