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

import { Certificate } from '@energyweb/origin';
import { Demand } from '@energyweb/market';
import { ProducingAsset, ConsumingAsset } from '@energyweb/asset-registry';
import { User } from '@energyweb/user-registry';
import { Configuration } from '@energyweb/utils-general';

export enum Actions {
    certificateCreatedOrUpdated = 'CERTIFICATE_CREATED_OR_UPDATED',
    demandCreated = 'DEMAND_CREATED',
    demandUpdated = 'DEMAND_UPDATED',
    demandDeleted = 'DEMAND_DELETED',
    producingAssetCreatedOrUpdated = 'PRODUCING_ASSET_CREATED_OR_UPDATED',
    consumingAssetCreatedOrUpdated = 'CONSUMING_ASSET_CREATED_OR_UPDATED',
    currentUserUpdated = 'CURRENT_USER_UPDATED',
    configurationUpdated = 'CONFIGURATION_UPDATED'
}

export const certificateCreatedOrUpdated = (certificate: Certificate.Entity): any => ({
    type: Actions.certificateCreatedOrUpdated,
    certificate
});

export const demandCreated = (demand: Demand.Entity) => ({
    type: Actions.demandCreated,
    demand
});

export const demandUpdated = (demand: Demand.Entity) => ({
    type: Actions.demandUpdated,
    demand
});

export const demandDeleted = (demand: Demand.Entity) => ({
    type: Actions.demandDeleted,
    demand
});

export const producingAssetCreatedOrUpdated = (producingAsset: ProducingAsset.Entity): any => ({
    type: Actions.producingAssetCreatedOrUpdated,
    producingAsset
});

export const consumingAssetCreatedOrUpdated = (consumingAsset: ConsumingAsset.Entity) => ({
    type: Actions.consumingAssetCreatedOrUpdated,
    consumingAsset
});

export const currentUserUpdated = (user: User): any => ({
    type: Actions.currentUserUpdated,
    user
});

export const configurationUpdated = (conf: Configuration.Entity): any => ({
    type: Actions.configurationUpdated,
    conf
});
