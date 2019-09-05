import Web3 from 'web3';
import { GeneralFunctions, ISpecialTx, ISearchLog } from './GeneralFunctions';
import UserContractLookupJSON from '../../build/contracts/UserContractLookup.json';

export class UserContractLookup extends GeneralFunctions {
    web3: Web3;

    buildFile = UserContractLookupJSON;

    constructor(web3: Web3, address?: string) {
        super(
            address
                ? new web3.eth.Contract(UserContractLookupJSON.abi, address)
                : new web3.eth.Contract(
                      UserContractLookupJSON.abi,
                      (UserContractLookupJSON as any).networks.length > 0
                          ? UserContractLookupJSON.networks[0]
                          : null
                  )
        );
        this.web3 = web3;
    }

    async getAllLogChangeOwnerEvents(eventFilter?: ISearchLog) {
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

        return this.web3Contract.getPastEvents('LogChangeOwner', filterParams);
    }

    async getAllEvents(eventFilter?: ISearchLog) {
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

        return this.web3Contract.getPastEvents('allEvents', filterParams);
    }

    async update(_userRegistry: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.update(_userRegistry);

        return this.send(method, txParams);
    }

    async userRegistry(txParams?: ISpecialTx) {
        return this.web3Contract.methods.userRegistry().call(txParams);
    }

    async owner(txParams?: ISpecialTx) {
        return this.web3Contract.methods.owner().call(txParams);
    }

    async changeOwner(_newOwner: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.changeOwner(_newOwner);

        return this.send(method, txParams);
    }

    async init(_userRegistry: string, _db: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.init(_userRegistry, _db);

        return this.send(method, txParams);
    }
}
