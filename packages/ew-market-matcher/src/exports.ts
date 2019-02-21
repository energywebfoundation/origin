import * as SchemaDefs from './schema-defs/MatcherConf';
import { Matcher } from './matcher/Matcher';
import { SimpleMatcher } from './matcher/SimpleMatcher';
import { ConfigurableReferenceMatcher } from './matcher/ConfigurableReferenceMatcher';
import { Controller } from './controller/Controller';
import { SimulationModeController } from './controller/SimulationModeController';
import { BlockchainModeController } from './controller/BlockchainModeController';
import { createBlockchainConf } from './controller/BlockchainConnection';

export {
    SchemaDefs, Matcher, SimpleMatcher, ConfigurableReferenceMatcher, Controller, SimulationModeController, BlockchainModeController, createBlockchainConf
}
