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
// @authors: slock.it GmbH; Heiko Burkhardt, heiko.burkhardt@slock.it; Martin Kuechler, martin.kuchler@slock.it

export { UserLogic } from './wrappedContracts/UserLogic';
export { UserContractLookup } from './wrappedContracts/UserContractLookup';

import UserDBJSON from '../build/contracts/UserDB.json';
import UserLogicJSON from '../build/contracts/UserLogic.json';
import UserContractLookupJSON from '../build/contracts/UserContractLookup.json';
export { UserDBJSON, UserLogicJSON, UserContractLookupJSON };

export { migrateUserRegistryContracts } from './utils/migrateContracts';

export { User, UserPropertiesOffChain, UserProperties } from './blockchain-facade/Users/User';
export { createBlockchainProperties } from './blockchain-facade/BlockchainPropertiesFactory';
export * from './wrappedContracts/RoleManagement';
