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

import * as fs from 'fs';
import * as path from 'path';
import { MarketContractLookup } from '../wrappedContracts/MarketContractLookup';
import Web3 from 'web3';

import { deploy } from 'ew-utils-deployment';
import { MarketContractLookupJSON, MarketLogicJSON, MarketDBJSON } from '..';

export async function migrateMarketRegistryContracts(
    web3: Web3,
    assetContractLookupAddress: string,
    deployKey: string
): Promise<JSON> {
    return new Promise<any>(async (resolve, reject) => {
        const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : '0x' + deployKey;

        const marketContractLookupAddress = (await deploy(web3, MarketContractLookupJSON.bytecode, {
            privateKey: privateKeyDeployment
        })).contractAddress;

        const marketLogicAddress = (await deploy(
            web3,
            MarketLogicJSON.bytecode +
                web3.eth.abi
                    .encodeParameters(
                        ['address', 'address'],
                        [assetContractLookupAddress, marketContractLookupAddress]
                    )
                    .substr(2),
            { privateKey: privateKeyDeployment }
        )).contractAddress;

        const marketDBAddress = (await deploy(
            web3,
            MarketDBJSON.bytecode +
                web3.eth.abi.encodeParameter('address', marketLogicAddress).substr(2),
            { privateKey: privateKeyDeployment }
        )).contractAddress;

        const marketContractLookup = new MarketContractLookup(web3, marketContractLookupAddress);

        await marketContractLookup.init(
            assetContractLookupAddress,
            marketLogicAddress,
            marketDBAddress,
            { privateKey: privateKeyDeployment }
        );

        const resultMapping = {} as any;
        resultMapping.MarketContractLookup = marketContractLookupAddress;
        resultMapping.MarketLogic = marketLogicAddress;
        resultMapping.MarketDB = marketDBAddress;

        resolve(resultMapping);
        /*
        const marketContractLookupWeb3 = await sloffle.deploy(
            path.resolve(__dirname, '../../contracts/MarketContractLookup.json'),
            [],
            { privateKey: privateKeyDeployment },
        );

        const marketLogicWeb3 = await sloffle.deploy(
            path.resolve(__dirname, '../../contracts/MarketLogic.json'),
            [assetContractLookupAddress, marketContractLookupWeb3._address],
            { privateKey: privateKeyDeployment },
        );

        const marketDBWeb3 = await sloffle.deploy(
            path.resolve(__dirname, '../../contracts/MarketDB.json'),
            [marketLogicWeb3._address],
            { privateKey: privateKeyDeployment },
        );

        const marketContractLookup: MarketContractLookup
            = new MarketContractLookup((web3 as any), marketContractLookupWeb3._address);

        await marketContractLookup.init(
            assetContractLookupAddress,
            marketLogicWeb3._address,
            marketDBWeb3._address,
            { privateKey: privateKeyDeployment });

        resolve(sloffle.deployedContracts);
        */
    });
}
