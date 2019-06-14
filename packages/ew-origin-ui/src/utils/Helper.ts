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

import axios from 'axios';
import { Configuration, Currency } from 'ew-utils-general-lib';

export const isOffChainProperty = (name: string, offChainProps: any): boolean => {
    for (const offChainPropName of Object.keys(offChainProps)) {
        if (offChainPropName === name) {
            return true;
        }
    }

    return false;
};

export const getOffChainText = (name: string, offChainProps: any): string => {
    return isOffChainProperty(name, offChainProps) ? ' (private)' : '';
};

export const setOffChainSettlementOptions = async (
    entityId: string,
    price: number,
    currency: Currency,
    conf: Configuration.Entity
): Promise<void> => {
    if (conf.offChainDataSource) {
        const certificateLogicAddress = conf.blockchainProperties.certificateLogicInstance.web3Contract._address;
        const axiosurl = `${conf.offChainDataSource.baseUrl}/TradableEntity/${certificateLogicAddress}/${entityId}`;

        await axios.put(axiosurl, {
            price,
            currency
        });
    }
};

export const getOffChainSettlementOptions = async (
    entityId: string,
    conf: Configuration.Entity
): Promise<any> => {
    if (conf.offChainDataSource) {
        const certificateLogicAddress = conf.blockchainProperties.certificateLogicInstance.web3Contract._address;
        const axiosurl = `${conf.offChainDataSource.baseUrl}/TradableEntity/${certificateLogicAddress}/${entityId}`;

        const result = await axios.get(axiosurl);

        return result.data;
    }
};
