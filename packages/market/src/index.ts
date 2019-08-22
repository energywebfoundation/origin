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
// @authors: slock.it GmbH; Martin Kuechler, martin.kuchler@slock.it; Heiko Burkhardt, heiko.burkhardt@slock.it

import * as Demand from './blockchain-facade/Demand';
import * as Supply from './blockchain-facade/Supply';
import * as Agreement from './blockchain-facade/Agreement';
import { createBlockchainProperties } from './blockchain-facade/BlockchainPropertiesFactory';

import MarketContractLookupJSON from '../build/contracts/MarketContractLookup.json';
import MarketDBJSON from '../build/contracts/MarketDB.json';
import MarketLogicJSON from '../build/contracts/MarketLogic.json';
import AgreementLogicJSON from '../build/contracts/AgreementLogic.json';

export { MarketContractLookupJSON, MarketDBJSON, MarketLogicJSON };
export { MarketLogic } from './wrappedContracts/MarketLogic';
export { MarketContractLookup } from './wrappedContracts/MarketContractLookup';
export { migrateMarketRegistryContracts } from './utils/migrateContracts';

export { Demand, Supply, Agreement, createBlockchainProperties };
