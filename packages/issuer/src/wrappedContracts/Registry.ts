import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { PastEventOptions } from 'web3-eth-contract';

import { GeneralFunctions, ISpecialTx } from '@energyweb/utils-general';

import RegistryJSON from '../../build/contracts/Registry.json';

export interface TransferSingleEvent {
    _id: string,
    _operator: string,
    _from: string,
    _to: string,
    _value: string
}

export interface ClaimSingleEvent {
    _claimIssuer: string,
    _claimSubject: string,
    _topic: string,
    _id: string,
    _value: string,
    _claimData: string
}

export class Registry extends GeneralFunctions {
    web3: Web3;

    constructor(web3: Web3, address?: string) {
        const buildFile = RegistryJSON;
        const buildFileAbi = buildFile.abi as AbiItem[];

        super(
            address
                ? new web3.eth.Contract(buildFileAbi, address)
                : new web3.eth.Contract(
                      buildFileAbi,
                      (buildFile.networks as any).length > 0 ? (buildFile.networks as any)[0] : null
                  )
        );
        this.web3 = web3;
    }

    async initialize(txParams: ISpecialTx) {
        const method = this.web3Contract.methods.initialize();

        return this.send(method, txParams);
    }

    async getAllEvents(eventFilter?: PastEventOptions) {
        return this.web3Contract.getPastEvents('allEvents', this.createFilter(eventFilter));
    }

    async getAllTransferSingleEvents(eventFilter?: PastEventOptions) {
        return this.web3Contract.getPastEvents('TransferSingle', this.createFilter(eventFilter));
    }

    async getAllTransferBatchEvents(eventFilter?: PastEventOptions) {
        return this.web3Contract.getPastEvents('TransferBatch', this.createFilter(eventFilter));
    }

    async getAllClaimSingleEvents(eventFilter?: PastEventOptions) {
        return this.web3Contract.getPastEvents('ClaimSingle', this.createFilter(eventFilter));
    }

    async getAllClaimBatchEvents(eventFilter?: PastEventOptions) {
        return this.web3Contract.getPastEvents('ClaimBatch', this.createFilter(eventFilter));
    }

    async getAllIssuanceSingleEvents(eventFilter?: PastEventOptions) {
        return this.web3Contract.getPastEvents('IssuanceSingle', this.createFilter(eventFilter));
    }

    async balanceOf(_tokenOwner: string, _id: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.balanceOf(_tokenOwner, _id).call(txParams);
    }

    async claimedBalanceOf(_tokenOwner: string, _id: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.claimedBalanceOf(_tokenOwner, _id).call(txParams);
    }

    async getCertificate(_certificateId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getCertificate(_certificateId).call(txParams);
    }

    async safeTransferFrom(
        _from: string,
        _to: string,
        _certificateId: number,
        _value: number,
        _data: number[],
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.safeTransferFrom(
            _from,
            _to,
            _certificateId,
            _value,
            _data
        );

        return this.send(method, txParams);
    }

    async safeTransferAndClaimFrom(
        _from: string,
        _to: string,
        _certificateId: number,
        _value: number,
        _data: number[],
        _claimData: number[],
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.safeTransferAndClaimFrom(
            _from,
            _to,
            _certificateId,
            _value,
            _data,
            _claimData
        );

        return this.send(method, txParams);
    }

    async safeBatchTransferAndClaimFrom(
        _from: string,
        _to: string,
        _ids: number[],
        _values: number[],
        _data: number[],
        _claimData: number[][],
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.safeBatchTransferAndClaimFrom(
            _from,
            _to,
            _ids,
            _values,
            _data,
            _claimData
        );

        return this.send(method, txParams);
    }

    async safeBatchTransferFrom(
        _from: string,
        _to: string,
        _ids: number[],
        _values: number[],
        _data: number[],
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.safeBatchTransferFrom(
            _from,
            _to,
            _ids,
            _values,
            _data
        );

        return this.send(method, txParams);
    }

    async totalSupply(txParams?: ISpecialTx) {
        return this.web3Contract.methods.totalSupply().call(txParams);
    }

    async issue(_to: string, _validityData: any, _topic: number, _value: number, _data: any, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.issue(
            _to,
            _validityData,
            _topic,
            _value,
            _data
        );

        return this.send(method, txParams);
    }
}
