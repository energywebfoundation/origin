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
import * as Winston from 'winston';
import * as ConfSchema from '../schemas/conf.schema.json';
import * as RuleSchema from '../schemas/rule.schema.json';
import { BlockchainModeController } from './controller/BlockchainModeController';
import { createBlockchainConf } from './controller/BlockchainConnection';

export const logger = Winston.createLogger({
  format: Winston.format.combine(
    Winston.format.colorize(),
    Winston.format.simple(),
  ),
  level: 'debug',
  transports: [
    new Winston.transports.Console({ level: 'silly' }),
  ],
});

const buildMatcher = (
    matcherSpecification: SchemaDefs.BlockchainMatcherSpecification | SchemaDefs.SimulationMatcherSpecification,
): Matcher => {
    switch (matcherSpecification.type) {

        case SchemaDefs.MatcherType.ConfigurableReference:
            const matcherConfig = JSON.parse(fs.readFileSync(matcherSpecification.matcherConfigFile, 'utf-8'));
            Controller.validateJson(matcherConfig, RuleSchema, 'Rule file');
            return new ConfigurableReferenceMatcher(matcherConfig);

        case SchemaDefs.MatcherType.Simple:
            return new SimpleMatcher();

        default :
            throw new Error('Unknown matcher type.');
    }
};



const buildController = async (
    dataSource: SchemaDefs.BlockchainDataSource | SchemaDefs.SimulationDataSource,
): Promise<Controller> => {
    logger.verbose('Data source type is ' + dataSource.type);
    switch (dataSource.type) {

        case SchemaDefs.BlockchainDataSourceType.Blockchain:
            const blockchainDataSource = dataSource as SchemaDefs.BlockchainDataSource;
            return new BlockchainModeController(
                await createBlockchainConf(blockchainDataSource),
                blockchainDataSource.matcherAddress,
            );
            throw new Error('Not implemented yet.');
    
        case SchemaDefs.SimulationDataSourceType.Simulation:
            return new SimulationModeController(dataSource as SchemaDefs.SimulationDataSource);
  
        default:
            throw new Error('Unknown data source type.');
    }
};

const main = async () => {

    logger.info('Matcher application started.');

    try {
        if (process.argv[2]) {

            fs.readFile(process.argv[2], 'utf-8', async (error, data) => {
                try {
                    const conf: SchemaDefs.MatcherConf = JSON.parse(data);
                    Controller.validateJson(conf, ConfSchema, 'Config file');
                    const matcher = buildMatcher(conf.matcherSpecification);
                    const controller = await buildController(conf.dataSource);
                    matcher.setController(controller);
                    controller.setMatcher(matcher);
                    controller.start();
                } catch (e) {
                    logger.error(e.message);
                }
                
            });

        } else {
            throw new Error('No config file specified');
        }
    } catch (e) {
        logger.error(e.message);
    }

};

main();
