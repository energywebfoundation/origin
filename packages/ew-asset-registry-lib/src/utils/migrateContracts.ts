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

import Web3 from 'web3';

import { AssetContractLookup } from '../wrappedContracts/AssetContractLookup';
import { deploy } from 'ew-utils-general-lib';
import {
    AssetContractLookupJSON,
    AssetConsumingDBJSON,
    AssetConsumingRegistryLogicJSON,
    AssetProducingDBJSON,
    AssetProducingRegistryLogicJSON
} from '..';

export async function migrateAssetRegistryContracts(
    web3: Web3,
    userContractLookup: string,
    deployKey: string
): Promise<JSON> {
    return new Promise<any>(async (resolve, reject) => {
        const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : '0x' + deployKey;
        const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment)
            .address;

        const assetContractLookupAddress = (await deploy(
            web3,
            (AssetContractLookupJSON as any).bytecode,
            { privateKey: privateKeyDeployment }
        )).contractAddress;

        const assetConsumingLogicAddress = (await deploy(
            web3,
            (AssetConsumingRegistryLogicJSON as any).bytecode +
                web3.eth.abi
                    .encodeParameters(
                        ['address', 'address'],
                        [userContractLookup, assetContractLookupAddress]
                    )
                    .substr(2),
            { privateKey: privateKeyDeployment }
        )).contractAddress;

        const assetConsumingDBAddress = (await deploy(
            web3,
            (AssetConsumingDBJSON as any).bytecode +
                web3.eth.abi.encodeParameter('address', assetConsumingLogicAddress).substr(2),
            { privateKey: privateKeyDeployment }
        )).contractAddress;

        const assetProducingLogicAddress = (await deploy(
            web3,
            (AssetProducingRegistryLogicJSON as any).bytecode +
                web3.eth.abi
                    .encodeParameters(
                        ['address', 'address'],
                        [userContractLookup, assetContractLookupAddress]
                    )
                    .substr(2),
            { privateKey: privateKeyDeployment }
        )).contractAddress;

        const assetProducingDBAddress = (await deploy(
            web3,
            (AssetProducingDBJSON as any).bytecode +
                web3.eth.abi.encodeParameter('address', assetProducingLogicAddress).substr(2),
            { privateKey: privateKeyDeployment }
        )).contractAddress;

        const assetContractLookup: AssetContractLookup = new AssetContractLookup(
            web3 as any,
            assetContractLookupAddress
        );

        await assetContractLookup.init(
            userContractLookup,
            assetProducingLogicAddress,
            assetConsumingLogicAddress,
            assetProducingDBAddress,
            assetConsumingDBAddress,
            { privateKey: privateKeyDeployment }
        );

        const resultMapping = {} as any;

        resultMapping.AssetContractLookup = assetContractLookupAddress;
        resultMapping.AssetConsumingRegistryLogic = assetConsumingLogicAddress;
        resultMapping.AssetConsumingDB = assetConsumingDBAddress;
        resultMapping.AssetProducingRegistryLogic = assetProducingLogicAddress;
        resultMapping.AssetProducingDB = assetProducingDBAddress;

        resolve(resultMapping);
    });
}
