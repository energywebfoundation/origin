import { Sloffle } from 'sloffle';
import { TestAccounts } from '../testing/TestAccounts';

import Web3Type from '../../types/web3';
import { UserLogic } from '../../contractWrapper/UserLogic';
import { UserContractLookup } from '../../contractWrapper/UserContractLookup';

export async function migrateContracts(web3: Web3Type): Promise<JSON> {
    return new Promise<any>(async (resolve, reject) => {

        const sloffle = new Sloffle(web3);

        const userContractLookupWeb3 = await sloffle.deploy(
            'UserContractLookup',
            [],
            { from: TestAccounts.topAdmin, privateKey: '0x' + TestAccounts.topAdminPK },
        );

        const userLogicWeb3 = await sloffle.deploy(
            'UserLogic',
            [userContractLookupWeb3._address],
            { from: TestAccounts.topAdmin, privateKey: '0x' + TestAccounts.topAdminPK },
        );

        const userDbWeb3 = await sloffle.deploy(
            'UserDB',
            [userLogicWeb3._address],
            { from: TestAccounts.topAdmin, privateKey: '0x' + TestAccounts.topAdminPK },
        );

        const userLogic = new UserLogic(web3, userLogicWeb3._address);
        await userLogic.init(
            userDbWeb3._address,
            { from: TestAccounts.topAdmin, privateKey: '0x' + TestAccounts.topAdminPK },
        );

        const userContractLookup = new UserContractLookup(web3, userContractLookupWeb3._address);
        await userContractLookup.init(
            userLogicWeb3._address,
            { from: TestAccounts.topAdmin, privateKey: '0x' + TestAccounts.topAdminPK },
        );

        resolve(sloffle.deployedContracts);
    });
}
