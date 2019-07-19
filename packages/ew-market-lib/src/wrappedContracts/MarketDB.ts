import { GeneralFunctions, SpecialTx, SearchLog, getClientVersion } from './GeneralFunctions';
import * as fs from 'fs';
import * as path from 'path';
import Web3 = require('web3');
import { Tx, BlockType } from 'web3/eth/types';
import { TransactionReceipt, Logs } from 'web3/types';
import { JsonRPCResponse } from 'web3/providers';
import MarketDBJSON from '../../build/contracts/MarketDB.json';

export class MarketDB extends GeneralFunctions {
    web3: Web3;
    buildFile = MarketDBJSON;

    constructor(web3: Web3, address?: string) {
        super(
            address
                ? new web3.eth.Contract(MarketDBJSON.abi, address)
                : new web3.eth.Contract(
                      MarketDBJSON.abi,
                      (MarketDBJSON as any).networks.length > 0 ? MarketDBJSON.networks[0] : null
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

    async getAllAgreementListLengthDB(txParams?: SpecialTx) {
        return await this.web3Contract.methods.getAllAgreementListLengthDB().call(txParams);
    }

    async getDemand(_demandId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getDemand(_demandId).call(txParams);
    }

    async setMatcherPropertiesAndURL(
        _agreementId: number,
        _matcherPropertiesDocumentHash: string,
        _matcherDBURL: string,
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.setMatcherPropertiesAndURL(_agreementId, _matcherPropertiesDocumentHash, _matcherDBURL);
        const transactionParams = await this.buildTransactionParams(method, txParams);

        return await this.send(method, transactionParams);
    }

    async createSupply(
        _propertiesDocumentHash: string,
        _documentDBURL: string,
        _assetId: number,
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.createSupply(_propertiesDocumentHash, _documentDBURL, _assetId);
        const transactionParams = await this.buildTransactionParams(method, txParams);

        return await this.send(method, transactionParams);
    }

    async setAgreementMatcher(_agreementId: number, _matchers: string[], txParams?: SpecialTx) {
        const method = this.web3Contract.methods.setAgreementMatcher(_agreementId, _matchers);
        const transactionParams = await this.buildTransactionParams(method, txParams);

        return await this.send(method, transactionParams);
    }

    async getAgreementDB(_agreementId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getAgreementDB(_agreementId).call(txParams);
    }

    async getAllSupplyListLength(txParams?: SpecialTx) {
        return await this.web3Contract.methods.getAllSupplyListLength().call(txParams);
    }

    async createDemand(
        _propertiesDocumentHash: string,
        _documentDBURL: string,
        _demandOwner: string,
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.createDemand(_propertiesDocumentHash, _documentDBURL, _demandOwner);
        const transactionParams = await this.buildTransactionParams(method, txParams);

        return await this.send(method, transactionParams);
    }

    async approveAgreementSupplyDB(_agreementId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.approveAgreementSupplyDB(_agreementId);
        const transactionParams = await this.buildTransactionParams(method, txParams);

        return await this.send(method, transactionParams);
    }

    async owner(txParams?: SpecialTx) {
        return await this.web3Contract.methods.owner().call(txParams);
    }

    async changeOwner(_newOwner: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.changeOwner(_newOwner);
        const transactionParams = await this.buildTransactionParams(method, txParams);

        return await this.send(method, transactionParams);
    }

    async approveAgreementDemandDB(_agreementId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.approveAgreementDemandDB(_agreementId);
        const transactionParams = await this.buildTransactionParams(method, txParams);

        return await this.send(method, transactionParams);
    }

    async createAgreementDB(
        _propertiesDocumentHash: string,
        _documentDBURL: string,
        _matcherPropertiesDocumentHash: string,
        _matcherDBURL: string,
        _demandId: number,
        _supplyId: number,
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods
            .createAgreementDB(
                _propertiesDocumentHash,
                _documentDBURL,
                _matcherPropertiesDocumentHash,
                _matcherDBURL,
                _demandId,
                _supplyId
            );
        const transactionParams = await this.buildTransactionParams(method, txParams);

        return await this.send(method, transactionParams);
    }

    async getSupply(_supplyId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getSupply(_supplyId).call(txParams);
    }

    async getAllDemandListLength(txParams?: SpecialTx) {
        return await this.web3Contract.methods.getAllDemandListLength().call(txParams);
    }
}
