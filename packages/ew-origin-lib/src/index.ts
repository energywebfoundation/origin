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
// @authors: slock.it GmbH; Martin Kuechler, martin.kuchler@slock.it; Heiko Burkhardt, heiko.burkhardt@slock.it;

import * as TradableEntity from './blockchain-facade/TradableEntity';
import * as Certificate from './blockchain-facade/Certificate';
import { createBlockchainProperties } from './blockchain-facade/BlockchainPropertiesFactory';

import CertificateDBJSON from '../build/contracts/CertificateDB.json';
import CertificateLogicJSON from '../build/contracts/CertificateLogic.json';
import CertificateSpecificContractJSON from '../build/contracts/CertificateSpecificContract.json';
import CertificateSpecificDBJSON from '../build/contracts/CertificateSpecificDB.json';
import EnergyCertificateBundleDBJSON from '../build/contracts/EnergyCertificateBundleDB.json';
import EnergyCertificateBundleLogicJSON from '../build/contracts/EnergyCertificateBundleLogic.json';
import EnergyDBJSON from '../build/contracts/EnergyDB.json';
import EnergyLogicJSON from '../build/contracts/EnergyLogic.json';
import OriginContractLookupJSON from '../build/contracts/OriginContractLookup.json';
import TradableEntityContractJSON from '../build/contracts/TradableEntityContract.json';
import TradableEntityDBJSON from '../build/contracts/TradableEntityDB.json';
import TradableEntityLogicJSON from '../build/contracts/TradableEntityLogic.json';

export {
    migrateCertificateRegistryContracts,
    migrateEnergyBundleContracts
} from './utils/migrateContracts';
export { CertificateLogic } from './wrappedContracts/CertificateLogic';
export { EnergyCertificateBundleLogic } from './wrappedContracts/EnergyCertificateBundleLogic';

export { OriginContractLookup } from './wrappedContracts/OriginContractLookup';

export {
    TradableEntity,
    Certificate,
    createBlockchainProperties,
    CertificateDBJSON,
    CertificateLogicJSON,
    CertificateSpecificContractJSON,
    CertificateSpecificDBJSON,
    EnergyCertificateBundleDBJSON,
    EnergyCertificateBundleLogicJSON,
    EnergyDBJSON,
    EnergyLogicJSON,
    OriginContractLookupJSON,
    TradableEntityContractJSON,
    TradableEntityDBJSON,
    TradableEntityLogicJSON
};
