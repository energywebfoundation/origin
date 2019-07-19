import { GeneralFunctions, SpecialTx, SearchLog } from './GeneralFunctions';
import Web3 = require('web3');
import MarketContractLookupJSON from '../../build/contracts/MarketContractLookup.json';

export class MarketContractLookup extends GeneralFunctions {
    web3: Web3;
    buildFile = MarketContractLookupJSON;

    constructor(web3: Web3, address?: string) {
        super(
            address
                ? new web3.eth.Contract(MarketContractLookupJSON.abi, address)
                : new web3.eth.Contract(
                      MarketContractLookupJSON.abi,
                      (MarketContractLookupJSON as any).networks.length > 0
                          ? MarketContractLookupJSON.networks[0]
                          : null
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

    async marketLogicRegistry(txParams?: SpecialTx) {
        return await this.web3Contract.methods.marketLogicRegistry().call(txParams);
    }

    async init(
        _assetRegistry: string,
        _marketLogicRegistry: string,
        _marketDB: string,
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.init(_assetRegistry, _marketLogicRegistry, _marketDB);
        const transactionParams = await this.buildTransactionParams(method, txParams);

        return await this.send(method, transactionParams);
    }

    async update(_marketRegistry: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.update(_marketRegistry);
        const transactionParams = await this.buildTransactionParams(method, txParams);

        return await this.send(method, transactionParams);
    }

    async assetContractLookupContract(txParams?: SpecialTx) {
        return await this.web3Contract.methods.assetContractLookupContract().call(txParams);
    }

    async assetContractLookup(txParams?: SpecialTx) {
        return await this.web3Contract.methods.assetContractLookup().call(txParams);
    }

    async owner(txParams?: SpecialTx) {
        return await this.web3Contract.methods.owner().call(txParams);
    }

    async changeOwner(_newOwner: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.changeOwner(_newOwner);
        const transactionParams = await this.buildTransactionParams(method, txParams);

        return await this.send(method, transactionParams);
    }
}
