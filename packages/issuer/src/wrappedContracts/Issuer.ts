import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { PastEventOptions } from 'web3-eth-contract';
import { GeneralFunctions, ISpecialTx, Timestamp } from '@energyweb/utils-general';
import IssuerJSON from '../../build/contracts/Issuer.json';

export class Issuer extends GeneralFunctions {
    web3: Web3;

    constructor(web3: Web3, address?: string) {
        const buildFile = IssuerJSON;
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

    async initialize(
        certificateTopic: number,
        registryAddress: string,
        owner: string,
        txParams: ISpecialTx
    ) {
        const method = this.web3Contract.methods.initialize(
            certificateTopic,
            registryAddress,
            owner
        );

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

    async getCertificationRequest(_certificationRequestId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods
            .getCertificationRequest(_certificationRequestId)
            .call(txParams);
    }

    async getCertificationRequestsForDevice(_deviceId: string, txParams?: ISpecialTx) {
        return this.web3Contract.methods
            .getCertificationRequestsForDevice(_deviceId)
            .call(txParams);
    }

    async requestCertification(_data: any, _isPrivate: boolean, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.requestCertification(_data, _isPrivate);

        return this.send(method, txParams);
    }

    async requestCertificationFor(
        _data: any,
        _forAddress: string,
        _isPrivate: boolean,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.requestCertificationFor(
            _data,
            _forAddress,
            _isPrivate
        );

        return this.send(method, txParams);
    }

    async approveCertificationRequest(
        _to: string,
        _requestId: number,
        _value: number,
        _validityData: string,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.approveCertificationRequest(
            _to,
            _requestId,
            _value,
            _validityData
        );

        return this.send(method, txParams);
    }

    async issue(_to: string, _value: number, _data: any, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.issue(_to, _value, _data);

        return this.send(method, txParams);
    }

    async approveCertificationRequestPrivate(
        _to: string,
        _requestId: number,
        _commitment: string,
        _validityData: string,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.approveCertificationRequestPrivate(
            _to,
            _requestId,
            _commitment,
            _validityData
        );

        return this.send(method, txParams);
    }

    async issuePrivate(_to: string, _commitment: string, _data: any, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.issuePrivate(_to, _commitment, _data);

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

    async requestMigrateToPublic(_certificateId: number, _hash: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.requestMigrateToPublic(_certificateId, _hash);

        return this.send(method, txParams);
    }

    async getMigrationRequestId(_certificateId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getMigrationRequestId(_certificateId).call(txParams);
    }

    async migrateToPublic(
        _requestId: number,
        _value: number,
        _salt: string,
        _proof: any,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.migrateToPublic(_requestId, _value, _salt, _proof);

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
            _commitment
        );

        return this.send(method, txParams);
    }

    async requestPrivateTransfer(_certificateId: number, _hash: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.requestPrivateTransfer(_certificateId, _hash);

        return this.send(method, txParams);
    }

    async getCertificationRequestForCertificate(_certificateId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods
            .getCertificationRequestForCertificate(_certificateId)
            .call(txParams);
    }

    async getCertificationRequestIdForCertificate(_certificateId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods
            .getCertificationRequestIdForCertificate(_certificateId)
            .call(txParams);
    }

    async getCertificateIdForCertificationRequest(_requestId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods
            .getCertificateIdForCertificationRequest(_requestId)
            .call(txParams);
    }

    async isCertificatePublic(_certificateId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.isCertificatePublic(_certificateId).call(txParams);
    }

    async getRegistryAddress(txParams?: ISpecialTx) {
        return this.web3Contract.methods.getRegistryAddress().call(txParams);
    }

    async totalRequests(txParams?: ISpecialTx) {
        return this.web3Contract.methods.totalRequests().call(txParams);
    }

    async version(txParams?: ISpecialTx) {
        return this.web3Contract.methods.version().call(txParams);
    }
}
