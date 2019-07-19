import { GeneralFunctions, SpecialTx, SearchLog } from './GeneralFunctions';
import Web3 = require('web3');
import Erc20TestTokenJSON from '../../build/contracts/Erc20TestToken.json';

export class Erc20TestToken extends GeneralFunctions {
    web3: Web3;
    buildFile = Erc20TestTokenJSON;

    constructor(web3: Web3, address?: string) {
        super(
            address
                ? new web3.eth.Contract(Erc20TestTokenJSON.abi, address)
                : new web3.eth.Contract(
                      Erc20TestTokenJSON.abi,
                      (Erc20TestTokenJSON as any).networks.length > 0
                          ? Erc20TestTokenJSON.networks[0]
                          : null
                  )
        );
        this.web3 = web3;
    }

    async getAllTransferEvents(eventFilter?: SearchLog) {
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

        return await this.web3Contract.getPastEvents('Transfer', filterParams);
    }

    async getAllApprovalEvents(eventFilter?: SearchLog) {
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

        return await this.web3Contract.getPastEvents('Approval', filterParams);
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

    async name(txParams?: SpecialTx) {
        return await this.web3Contract.methods.name().call(txParams);
    }

    async approve(_spender: string, _tokens: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.approve(_spender, _tokens);
        const transactionParams = await this.buildTransactionParams(method, txParams);
            
        return await this.send(method, transactionParams);
    }

    async totalSupplyNumber(txParams?: SpecialTx) {
        return await this.web3Contract.methods.totalSupplyNumber().call(txParams);
    }

    async decimas(txParams?: SpecialTx) {
        return await this.web3Contract.methods.decimas().call(txParams);
    }

    async totalSupply(txParams?: SpecialTx) {
        return await this.web3Contract.methods.totalSupply().call(txParams);
    }

    async transferFrom(_from: string, _to: string, _tokens: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.transferFrom(_from, _to, _tokens);
        const transactionParams = await this.buildTransactionParams(method, txParams);
            
        return await this.send(method, transactionParams);
    }

    async balances(param0: string, txParams?: SpecialTx) {
        return await this.web3Contract.methods.balances(param0).call(txParams);
    }

    async allowed(param0: string, param1: string, txParams?: SpecialTx) {
        return await this.web3Contract.methods.allowed(param0, param1).call(txParams);
    }

    async balanceOf(_tokenOwner: string, txParams?: SpecialTx) {
        return await this.web3Contract.methods.balanceOf(_tokenOwner).call(txParams);
    }

    async owner(txParams?: SpecialTx) {
        return await this.web3Contract.methods.owner().call(txParams);
    }

    async symbol(txParams?: SpecialTx) {
        return await this.web3Contract.methods.symbol().call(txParams);
    }

    async transfer(_to: string, _tokens: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.transfer(_to, _tokens);
        const transactionParams = await this.buildTransactionParams(method, txParams);
            
        return await this.send(method, transactionParams);
    }

    async allowance(_tokenOwner: string, _spender: string, txParams?: SpecialTx) {
        return await this.web3Contract.methods.allowance(_tokenOwner, _spender).call(txParams);
    }
}
