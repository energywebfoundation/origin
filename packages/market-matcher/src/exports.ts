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
// @authors: slock.it GmbH, Heiko Burkhardt, heiko.burkhardt@slock.it

import * as fs from 'fs';

import * as SchemaDefs from './schema-defs/MatcherConf';
import { Matcher } from './matcher/Matcher';
import { SimpleMatcher } from './matcher/SimpleMatcher';
import { ConfigurableReferenceMatcher } from './matcher/ConfigurableReferenceMatcher';
import { Controller } from './controller/Controller';
import { SimulationModeController } from './controller/SimulationModeController';
import * as ConfSchema from '../schemas/conf.schema.json';
import * as RuleSchema from '../schemas/rule.schema.json';
import { BlockchainModeController } from './controller/BlockchainModeController';
import { createBlockchainConf } from './controller/BlockchainConnection';
import { logger } from './Logger';
import * as MatcherLogic from './matcher/MatcherLogic';
import { StrategyBasedMatcher } from './matcher/StrategyBasedMatcher';
import { LowestPriceStrategy } from './strategy/LowestPriceStrategy';

const METHOD_NOT_IMPLEMENTED = 'Method not implemented.';

const buildMatcher = (
    matcherSpecification:
        | SchemaDefs.IBlockchainMatcherSpecification
        | SchemaDefs.ISimulationMatcherSpecification
): Matcher => {
    switch (matcherSpecification.type) {
        case SchemaDefs.MatcherType.ConfigurableReference:
            const matcherConfig = JSON.parse(
                fs.readFileSync(matcherSpecification.matcherConfigFile, 'utf-8')
            );
            Controller.validateJson(matcherConfig, RuleSchema, 'Rule file');

            return new ConfigurableReferenceMatcher(matcherConfig);

        case SchemaDefs.MatcherType.Simple:
            return new SimpleMatcher();

        case SchemaDefs.MatcherType.Strategy:
            return new StrategyBasedMatcher(new LowestPriceStrategy());

        default:
            throw new Error('Unknown matcher type.');
    }
};

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
            const matcher = buildMatcher(conf.matcherSpecification);
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
