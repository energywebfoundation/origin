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
import { deploy } from '@energyweb/utils-general';
import { UserContractLookup } from '../wrappedContracts/UserContractLookup';
import UserDBJSON from '../../build/contracts/UserDB.json';
import UserLogicJSON from '../../build/contracts/UserLogic.json';
import { UserContractLookupJSON } from '..';

export async function migrateUserRegistryContracts(web3: Web3, deployKey: string): Promise<JSON> {
    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;

    const userContractLookupAddress = (await deploy(web3, UserContractLookupJSON.bytecode, {
        privateKey: privateKeyDeployment
    })).contractAddress;

    const userLogicAddress = (await deploy(
        web3,
        UserLogicJSON.bytecode +
            web3.eth.abi.encodeParameter('address', userContractLookupAddress).substr(2),
        { privateKey: privateKeyDeployment }
    )).contractAddress;

    const userDBAddress = (await deploy(
        web3,
        UserDBJSON.bytecode + web3.eth.abi.encodeParameter('address', userLogicAddress).substr(2),
        { privateKey: privateKeyDeployment }
    )).contractAddress;

    const userContractLookup = new UserContractLookup(web3 as any, userContractLookupAddress);
    await userContractLookup.init(userLogicAddress, userDBAddress, {
        privateKey: privateKeyDeployment
    });

    const resultMapping = {} as any;

    resultMapping.UserContractLookup = userContractLookupAddress;
    resultMapping.UserLogic = userLogicAddress;
    resultMapping.UserDB = userDBAddress;

    return resultMapping;
}
