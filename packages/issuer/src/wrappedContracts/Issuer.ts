import Web3 from 'web3';

import { GeneralFunctions, ISpecialTx, Timestamp } from '@energyweb/utils-general';

import IssuerJSON from '../../build/contracts/Issuer.json';
import { PastEventOptions } from 'web3-eth-contract';

export class Issuer extends GeneralFunctions {
    web3: Web3;

    constructor(web3: Web3, address?: string) {
        const buildFile: any = IssuerJSON;
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

    async initialize(certificateTopic: number, registryAddress: string, owner: string, txParams: ISpecialTx) {
        const method = this.web3Contract.methods.initialize(certificateTopic, registryAddress, owner);

        return this.send(method, txParams);
    }

    async getAllEvents(eventFilter?: PastEventOptions) {
        return this.web3Contract.getPastEvents('allEvents', this.createFilter(eventFilter));
    }

    async encodeData(_from: Timestamp, _to: Timestamp, _deviceId: string, txParams?: ISpecialTx) {
        return this.web3Contract.methods.encodeData(_from, _to, _deviceId).call(txParams);
    }

    async decodeData(_data: number[], txParams?: ISpecialTx) {
        return this.web3Contract.methods.decodeData(_data).call(txParams);
    }

    async getIssuanceRequest(_issuanceRequestId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getIssuanceRequest(_issuanceRequestId).call(txParams);
    }

    async getIssuanceRequestsForDevice(_deviceId: string, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getIssuanceRequestsForDevice(_deviceId).call(txParams);
    }

    async requestIssuance(_data: any, _isPrivate: boolean, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.requestIssuance(_data, _isPrivate);

        return this.send(method, txParams);
    }

    async requestIssuanceFor(_data: any, _forAddress: string, _isPrivate: boolean,  txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.requestIssuanceFor(_data, _forAddress, _isPrivate);

        return this.send(method, txParams);
    }

    async approveIssuance(
        _to: string,
        _requestId: number,
        _value: number,
        _validityData: string,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.approveIssuance(
            _to,
            _requestId,
            _value,
            _validityData,
        );

        return this.send(method, txParams);
    }

    async issue(
        _to: string,
        _value: number,
        _data: any,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.issue(
            _to,
            _value,
            _data
        );

        return this.send(method, txParams);
    }

    async approveIssuancePrivate(
        _to: string,
        _requestId: number,
        _commitment: string,
        _validityData: string,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.approveIssuancePrivate(
            _to,
            _requestId,
            _commitment,
            _validityData,
        );

        return this.send(method, txParams);
    }

    async issuePrivate(
        _to: string,
        _commitment: string,
        _data: any,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.issue(
            _to,
            _commitment,
            _data
        );

        return this.send(method, txParams);
    }

    async revokeRequest(_requestId: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.revokeRequest(_requestId);

        return this.send(method, txParams);
    }

    async revokeCertificate(_certificateId: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.revokeCertificate(_certificateId);

        return this.send(method, txParams);
    }

    async updateCommitment(
        _id: number,
        _previousCommitment: string,
        _commitment: string,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.updateCommitment(
            _id,
            _previousCommitment,
            _commitment
        );

        return this.send(method, txParams);
    }

    async requestMigrateToPublic(
        _certificateId: number,
        _hash: string,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.requestMigrateToPublic(
            _certificateId,
            _hash
        );

        return this.send(method, txParams);
    }

    async migrateToPublic(
        _requestId: number,
        _value: number,
        _salt: string,
        _proof: any,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.migrateToPublic(
            _requestId,
            _value,
            _salt,
            _proof
        );

        return this.send(method, txParams);
    }

    async approvePrivateTransfer(
        _requestId: number,
        _proof: any,
        _previousCommitment: string,
        _commitment: string,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.approvePrivateTransfer(
            _requestId,
            _proof,
            _previousCommitment,
            _commitment,
        );

        return this.send(method, txParams);
    }

    async requestPrivateTransfer(_certificateId: number, _hash: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.requestPrivateTransfer(_certificateId, _hash);

        return this.send(method, txParams);
    }

    async getRegistryAddress(txParams?: ISpecialTx) {
        return this.web3Contract.methods.getRegistryAddress().call(txParams);
    }

    async version(txParams?: ISpecialTx) {
        return this.web3Contract.methods.version().call(txParams);
    }
}
