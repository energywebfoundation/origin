import Web3 from 'web3';
import { GeneralFunctions, ISpecialTx } from '@energyweb/utils-general';
import { PastEventOptions } from 'web3-eth-contract';
import Erc20TestTokenJSON from '../../build/contracts/Erc20TestToken.json';

export class Erc20TestToken extends GeneralFunctions {
    web3: Web3;

    constructor(web3: Web3, address?: string) {
        const buildFile: any = Erc20TestTokenJSON;
        super(
            address
                ? new web3.eth.Contract(buildFile.abi, address)
                : new web3.eth.Contract(
                      buildFile.abi,
                      buildFile.networks.length > 0 ? buildFile.networks[0] : null
                  )
        );
        this.web3 = web3;
    }

    async getAllTransferEvents(eventFilter?: PastEventOptions) {
        let filterParams: any;
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

        return this.web3Contract.getPastEvents('Transfer', eventFilter);
    }

    async getAllApprovalEvents(eventFilter?: PastEventOptions) {
        let filterParams: any;
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

        return this.web3Contract.getPastEvents('Approval', eventFilter);
    }

    async getAllEvents(eventFilter?: PastEventOptions) {
        return this.web3Contract.getPastEvents('allEvents', eventFilter);
    }

    async initialize(testAccount: string, txParams: ISpecialTx) {
        const method = this.web3Contract.methods.initialize(testAccount);

        return this.send(method, txParams);
    }

    async name(txParams?: ISpecialTx) {
        return this.web3Contract.methods.name().call(txParams);
    }

    async approve(_spender: string, _tokens: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.approve(_spender, _tokens);

        return this.send(method, txParams);
    }

    async totalSupplyNumber(txParams?: ISpecialTx) {
        return this.web3Contract.methods.totalSupplyNumber().call(txParams);
    }

    async decimas(txParams?: ISpecialTx) {
        return this.web3Contract.methods.decimas().call(txParams);
    }

    async totalSupply(txParams?: ISpecialTx) {
        return this.web3Contract.methods.totalSupply().call(txParams);
    }

    async transferFrom(_from: string, _to: string, _tokens: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.transferFrom(_from, _to, _tokens);

        return this.send(method, txParams);
    }

    async balances(param0: string, txParams?: ISpecialTx) {
        return this.web3Contract.methods.balances(param0).call(txParams);
    }

    async allowed(param0: string, param1: string, txParams?: ISpecialTx) {
        return this.web3Contract.methods.allowed(param0, param1).call(txParams);
    }

    async balanceOf(_tokenOwner: string, txParams?: ISpecialTx) {
        return this.web3Contract.methods.balanceOf(_tokenOwner).call(txParams);
    }

    async owner(txParams?: ISpecialTx) {
        return this.web3Contract.methods.owner().call(txParams);
    }

    async symbol(txParams?: ISpecialTx) {
        return this.web3Contract.methods.symbol().call(txParams);
    }

    async transfer(_to: string, _tokens: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.transfer(_to, _tokens);

        return this.send(method, txParams);
    }

    async allowance(_tokenOwner: string, _spender: string, txParams?: ISpecialTx) {
        return this.web3Contract.methods.allowance(_tokenOwner, _spender).call(txParams);
    }
}
