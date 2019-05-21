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

import * as fs from 'fs';
import * as path from 'path';
import { OriginContractLookup } from '../wrappedContracts/OriginContractLookup';
import { AssetContractLookup } from 'ew-asset-registry-lib';
import Web3 from 'web3';
import { deploy } from 'ew-utils-deployment';
import {
    OriginContractLookupJSON,
    CertificateLogicJSON,
    CertificateDBJSON,
    EnergyCertificateBundleLogicJSON,
    EnergyCertificateBundleDBJSON
} from '..';

export async function migrateCertificateRegistryContracts(
    web3: Web3,
    assetContractLookupAddress: string,
    deployKey: string
): Promise<JSON> {
    return new Promise<any>(async (resolve, reject) => {
        const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : '0x' + deployKey;
        const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment)
            .address;

        const originContractLookupAddress = (await deploy(web3, OriginContractLookupJSON.bytecode, {
            privateKey: privateKeyDeployment
        })).contractAddress;
        console.log({
            assetContractLookupAddress,
            originContractLookupAddress
        });

        const test = web3.eth.abi
            .encodeParameters(
                ['address', 'address'],
                [assetContractLookupAddress, originContractLookupAddress]
            )
            .substr(2);
        console.log({
            first: OriginContractLookupJSON.bytecode.length,
            second: (CertificateLogicJSON.bytecode + test).length
        });

        const certificateLogicAddress = (await deploy(
            web3,
            CertificateLogicJSON.bytecode +
                web3.eth.abi
                    .encodeParameters(
                        ['address', 'address'],
                        [assetContractLookupAddress, originContractLookupAddress]
                    )
                    .substr(2),
            { privateKey: privateKeyDeployment }
        )).contractAddress;
        console.log({ certificateLogicAddress });

        const certificateDBAddress = (await deploy(
            web3,
            CertificateDBJSON.bytecode +
                web3.eth.abi.encodeParameter('address', certificateLogicAddress).substr(2),
            { privateKey: privateKeyDeployment }
        )).contractAddress;
        console.log({ certificateDBAddress });

        const originContractLookup: OriginContractLookup = new OriginContractLookup(
            web3,
            originContractLookupAddress
        );
        console.log({ originContractLookup });

        await originContractLookup.init(
            assetContractLookupAddress,
            certificateLogicAddress,
            certificateDBAddress,
            { privateKey: privateKeyDeployment }
        );

        const resultMapping = {} as any;
        resultMapping.OriginContractLookup = originContractLookupAddress;
        resultMapping.CertificateLogic = certificateLogicAddress;
        resultMapping.CertificateDB = certificateDBAddress;
        console.log({ resultMapping });

        resolve(resultMapping);
    });
}

export async function migrateEnergyBundleContracts(
    web3: Web3,
    assetContractLookupAddress: string,
    deployKey: string
): Promise<JSON> {
    return new Promise<any>(async (resolve, reject) => {
        const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : '0x' + deployKey;
        const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment)
            .address;

        const originContractLookupAddress = (await deploy(web3, OriginContractLookupJSON.bytecode, {
            privateKey: privateKeyDeployment
        })).contractAddress;

        const energyCertificateBundleLogicAddress = (await deploy(
            web3,
            EnergyCertificateBundleLogicJSON.bytecode +
                web3.eth.abi
                    .encodeParameters(
                        ['address', 'address'],
                        [assetContractLookupAddress, originContractLookupAddress]
                    )
                    .substr(2),
            { privateKey: privateKeyDeployment }
        )).contractAddress;

        const energyCertificateBundleDBAddress = (await deploy(
            web3,
            EnergyCertificateBundleDBJSON.bytecode +
                web3.eth.abi
                    .encodeParameter('address', energyCertificateBundleLogicAddress)
                    .substr(2),
            { privateKey: privateKeyDeployment }
        )).contractAddress;

        const originContractLookup: OriginContractLookup = new OriginContractLookup(
            web3,
            originContractLookupAddress
        );

        await originContractLookup.init(
            assetContractLookupAddress,
            energyCertificateBundleLogicAddress,
            energyCertificateBundleDBAddress,
            { privateKey: privateKeyDeployment }
        );

        const resultMapping = {} as any;
        resultMapping.OriginContractLookup = originContractLookupAddress;
        resultMapping.EnergyCertificateBundleLogic = energyCertificateBundleLogicAddress;
        resultMapping.EnergyCertificateBundleDB = energyCertificateBundleDBAddress;

        resolve(resultMapping);
    });
}
