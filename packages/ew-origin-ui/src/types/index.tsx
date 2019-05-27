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

// import { Web3Service } from '../utils/Web3Service'
// import { ProducingAsset, Certificate, Demand, User, EventHandlerManager, ContractEventHandler, ConsumingAsset } from 'ewf-coo'
import * as EwAsset from 'ew-asset-registry-lib';
import * as OriginIssuer from 'ew-origin-lib';
import * as EwUser from 'ew-user-registry-lib';
import { Configuration } from 'ew-utils-general-lib';
import { Demand } from 'ew-market-lib';

export interface StoreState {
    configuration: Configuration.Entity;
    producingAssets: EwAsset.ProducingAsset.Entity[];
    consumingAssets: EwAsset.ConsumingAsset.Entity[];
    certificates: OriginIssuer.Certificate.Entity[];
    demands: Demand.Entity[];
    currentUser: EwUser.User;
}

export interface Actions {
    certificateCreatedOrUpdated: Function;
    currentUserUpdated: Function;
    consumingAssetCreatedOrUpdated: Function;
    demandCreatedOrUpdated: Function;
    producingAssetCreatedOrUpdated: Function;
    configurationUpdated: Function;
}
