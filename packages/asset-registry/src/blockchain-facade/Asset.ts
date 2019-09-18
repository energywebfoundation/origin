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

import { BlockchainDataModelEntity, Configuration } from '@energyweb/utils-general';

export interface IOnChainProperties extends BlockchainDataModelEntity.IOnChainProperties {
    // certificatesUsedForWh: number;
    smartMeter: Configuration.EthAccount;
    owner: Configuration.EthAccount;
    lastSmartMeterReadWh: number;
    active: boolean;
    lastSmartMeterReadFileHash: string;
}

export interface IOffChainProperties {
    operationalSince: number;
    capacityWh: number;
    country: string;
    region: string;
    zip: string;
    city: string;
    street: string;
    houseNumber: string;
    gpsLatitude: string;
    gpsLongitude: string;
    facilityName: string;
}

export abstract class Entity extends BlockchainDataModelEntity.Entity
    implements IOnChainProperties {
    offChainProperties: IOffChainProperties;
    certificatesUsedForWh: number;
    smartMeter: Configuration.EthAccount;
    owner: Configuration.EthAccount;
    lastSmartMeterReadWh: number;
    lastSmartMeterReadFileHash: string;
    propertiesDocumentHash: string;
    url: string;
    active: boolean;

    initialized: boolean;

    configuration: Configuration.Entity;

    constructor(id: string, configuration: Configuration.Entity) {
        super(id, configuration);

        this.initialized = false;
    }
}
