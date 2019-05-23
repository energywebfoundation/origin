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

import * as EwGeneralLib from 'ew-utils-general-lib';
import * as Winston from 'winston';
import Web3 from 'web3';
import { createBlockchainProperties as assetCreateBlockchainProperties } from 'ew-asset-registry-lib';
import { MarketContractLookup, MarketLogic } from '..';

export const createBlockchainProperties = async (
    logger: Winston.Logger,
    web3: Web3,
    marketContractLookupAddress: string
): Promise<EwGeneralLib.Configuration.BlockchainProperties> => {
    const marketLookupContractInstance: MarketContractLookup = new MarketContractLookup(
        web3,
        marketContractLookupAddress
    );

    const assetBlockchainProperties: EwGeneralLib.Configuration.BlockchainProperties = (await assetCreateBlockchainProperties(
        logger,
        web3 as any,
        await marketLookupContractInstance.assetContractLookup()
    )) as any;

    return {
        consumingAssetLogicInstance: assetBlockchainProperties.consumingAssetLogicInstance,
        marketLogicInstance: new MarketLogic(
            web3,
            await marketLookupContractInstance.marketLogicRegistry()
        ),
        producingAssetLogicInstance: assetBlockchainProperties.producingAssetLogicInstance,
        userLogicInstance: assetBlockchainProperties.userLogicInstance,
        web3: web3 as any
    };
};
