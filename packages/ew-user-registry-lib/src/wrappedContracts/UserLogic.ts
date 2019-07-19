import { GeneralFunctions, SpecialTx, SearchLog } from './GeneralFunctions';
import Web3 = require('web3');
import UserLogicJSON from '../../build/contracts/UserLogic.json';

export class UserLogic extends GeneralFunctions {
    web3: Web3;
    buildFile = UserLogicJSON;

    constructor(web3: Web3, address?: string) {
        super(
            address
                ? new web3.eth.Contract(UserLogicJSON.abi, address)
                : new web3.eth.Contract(
                      UserLogicJSON.abi,
                      (UserLogicJSON as any).networks.length > 0 ? UserLogicJSON.networks[0] : null
                  )
        );
        this.web3 = web3;
    }

    async getAllLogChangeOwnerEvents(eventFilter?: SearchLog) {
        let filterParams;
        if (eventFilter) {
            filterParams = {
                fromBlock: eventFilter.fromBlock ? eventFilter.fromBlock : 0,
                toBlock: eventFilter.toBlock ? eventFilter.toBlock : 'latest'
            };
            if (eventFilter.topics) {
                filterParams.topics = eventFilter.topics;
            }
        } else {
            filterParams = {
                fromBlock: 0,
                toBlock: 'latest'
            };
        }

        return await this.web3Contract.getPastEvents('LogChangeOwner', filterParams);
    }

    async getAllEvents(eventFilter?: SearchLog) {
        let filterParams;
        if (eventFilter) {
            filterParams = {
                fromBlock: eventFilter.fromBlock ? eventFilter.fromBlock : 0,
                toBlock: eventFilter.toBlock ? eventFilter.toBlock : 'latest',
                topics: eventFilter.topics ? eventFilter.topics : [null]
            };
        } else {
            filterParams = {
                fromBlock: 0,
                toBlock: 'latest',
                topics: [null]
            };
        }

        return await this.web3Contract.getPastEvents('allEvents', filterParams);
    }

    async deactivateUser(_user: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.deactivateUser(_user);
        const transactionParams = await this.buildTransactionParams(method, txParams);

        return await this.send(method, transactionParams);
    }

    async update(_newLogic: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.update(_newLogic);
        const transactionParams = await this.buildTransactionParams(method, txParams);

        return await this.send(method, transactionParams);
    }

    async getRolesRights(_user: string, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getRolesRights(_user).call(txParams);
    }

    async setRoles(_user: string, _rights: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.setRoles(_user, _rights);
        const transactionParams = await this.buildTransactionParams(method, txParams);

        return await this.send(method, transactionParams);
    }

    async setUser(_user: string, _organization: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.setUser(_user, _organization);
        const transactionParams = await this.buildTransactionParams(method, txParams);

        return await this.send(method, transactionParams);
    }

    async userContractLookup(txParams?: SpecialTx) {
        return await this.web3Contract.methods.userContractLookup().call(txParams);
    }

    async db(txParams?: SpecialTx) {
        return await this.web3Contract.methods.db().call(txParams);
    }

    async owner(txParams?: SpecialTx) {
        return await this.web3Contract.methods.owner().call(txParams);
    }

    async changeOwner(_newOwner: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.changeOwner(_newOwner);
        const transactionParams = await this.buildTransactionParams(method, txParams);

        return await this.send(method, transactionParams);
    }

    async isRole(_role: number, _caller: string, txParams?: SpecialTx) {
        return await this.web3Contract.methods.isRole(_role, _caller).call(txParams);
    }

    async getFullUser(_user: string, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getFullUser(_user).call(txParams);
    }

    async doesUserExist(_user: string, txParams?: SpecialTx) {
        return await this.web3Contract.methods.doesUserExist(_user).call(txParams);
    }

    async init(_database: string, _admin: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.init(_database, _admin);
        const transactionParams = await this.buildTransactionParams(method, txParams);

        return await this.send(method, transactionParams);
    }
}
