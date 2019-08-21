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

import Web3 from 'web3';
import * as Winston from 'winston';

import { Configuration } from 'ew-utils-general-lib';
import { createBlockchainProperties as assetCreateBlockchainProperties } from 'ew-asset-registry-lib';

import { CertificateLogic, OriginContractLookup } from '..';

export const createBlockchainProperties = async (
    logger: Winston.Logger,
    web3: Web3,
    originContractLookupAddress: string
): Promise<Configuration.BlockchainProperties> => {
    const originLookupContractInstance: OriginContractLookup = new OriginContractLookup(
        web3,
        originContractLookupAddress
    );

    const assetBlockchainProperties: Configuration.BlockchainProperties = await assetCreateBlockchainProperties(
        logger,
        web3,
        await originLookupContractInstance.assetContractLookup()
    );

    return {
        certificateLogicInstance: new CertificateLogic(
            web3,
            await originLookupContractInstance.originLogicRegistry()
        ),
        consumingAssetLogicInstance: assetBlockchainProperties.consumingAssetLogicInstance,
        producingAssetLogicInstance: assetBlockchainProperties.producingAssetLogicInstance,
        userLogicInstance: assetBlockchainProperties.userLogicInstance,
        web3
    };
};
