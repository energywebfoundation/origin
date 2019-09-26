import { GeneralFunctions, ISpecialTx, ISearchLog, getClientVersion } from '@energyweb/utils-general';
import * as fs from 'fs';
import * as path from 'path';
import Web3 from 'web3';
import { Tx, BlockType } from 'web3/eth/types';
import { TransactionReceipt, Logs } from 'web3/types';
import { JsonRPCResponse } from 'web3/providers';
import OriginContractLookupJSON from '../../build/contracts/lightweight/OriginContractLookup.json';

export class OriginContractLookup extends GeneralFunctions {
    web3: Web3;
    buildFile = OriginContractLookupJSON;

    constructor(web3: Web3, address?: string) {
        super(
            address
                ? new web3.eth.Contract(OriginContractLookupJSON.abi, address)
                : new web3.eth.Contract(
                      OriginContractLookupJSON.abi,
                      (OriginContractLookupJSON as any).networks.length > 0
                          ? (OriginContractLookupJSON as any).networks[0]
                          : null
                  )
        );
        this.web3 = web3;
    }

    async getAllLogChangeOwnerEvents(eventFilter?: ISearchLog) {
        return await this.web3Contract.getPastEvents('LogChangeOwner', eventFilter);
    }

    async getAllEvents(eventFilter?: ISearchLog) {
        return await this.web3Contract.getPastEvents('allEvents', eventFilter);
    }

    async init(
        _assetRegistry: string,
        _originLogicRegistry: string,
        _originDB: string,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.init(
            _assetRegistry,
            _originLogicRegistry,
            _originDB
        );

        return await this.send(method, txParams);
    }

    async update(_originRegistry: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.update(_originRegistry);

        return await this.send(method, txParams);
    }

    async assetContractLookup(txParams?: ISpecialTx) {
        return await this.web3Contract.methods.assetContractLookup().call(txParams);
    }

    async originLogicRegistry(txParams?: ISpecialTx) {
        return await this.web3Contract.methods.originLogicRegistry().call(txParams);
    }

    async owner(txParams?: ISpecialTx) {
        return await this.web3Contract.methods.owner().call(txParams);
    }

    async changeOwner(_newOwner: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.changeOwner(_newOwner);

        return await this.send(method, txParams);
    }
}
