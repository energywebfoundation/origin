import { ISpecialTx, ISearchLog, getClientVersion } from '@energyweb/utils-general';
import Web3 from 'web3';
import CertificateLogicJSON from '../../build/contracts/lightweight/CertificateLogic.json';
import { CertificateSpecificContract } from './CertificateSpecificContract';

export class CertificateLogic extends CertificateSpecificContract {
    web3: Web3;

    constructor(web3: Web3, address?: string) {
        super(web3, address);

        const buildFile: any = CertificateLogicJSON;
        this.web3Contract = address
            ? new web3.eth.Contract(buildFile.abi, address)
            : new web3.eth.Contract(
                buildFile.abi,
                buildFile.networks.length > 0
                    ? buildFile.networks[0]
                    : null
            );
    }

    async getAllLogCreatedCertificateEvents(eventFilter?: ISearchLog) {
        return this.web3Contract.getPastEvents('LogCreatedCertificate', eventFilter);
    }

    async getAllLogCertificateRetiredEvents(eventFilter?: ISearchLog) {
        return this.web3Contract.getPastEvents('LogCertificateRetired', eventFilter);
    }

    async getAllLogCertificateSplitEvents(eventFilter?: ISearchLog) {
        return this.web3Contract.getPastEvents('LogCertificateSplit', eventFilter);
    }

    async getAllTransferEvents(eventFilter?: ISearchLog) {
        return this.web3Contract.getPastEvents('Transfer', eventFilter);
    }

    async getAllApprovalEvents(eventFilter?: ISearchLog) {
        return this.web3Contract.getPastEvents('Approval', eventFilter);
    }

    async getAllApprovalForAllEvents(eventFilter?: ISearchLog) {
        return this.web3Contract.getPastEvents('ApprovalForAll', eventFilter);
    }

    async getAllLogChangeOwnerEvents(eventFilter?: ISearchLog) {
        return this.web3Contract.getPastEvents('LogChangeOwner', eventFilter);
    }

    async getAllEvents(eventFilter?: ISearchLog) {
        return this.web3Contract.getPastEvents('allEvents', eventFilter);
    }

    async supportsInterface(_interfaceID: string, txParams?: ISpecialTx) {
        return this.web3Contract.methods.supportsInterface(_interfaceID).call(txParams);
    }

    async getApproved(_tokenId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getApproved(_tokenId).call(txParams);
    }

    async approve(_approved: string, _entityId: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.approve(_approved, _entityId);

        return this.send(method, txParams);
    }

    async update(_newLogic: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.update(_newLogic);

        return this.send(method, txParams);
    }

    async transferFrom(_from: string, _to: string, _entityId: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.transferFrom(_from, _to, _entityId);

        return this.send(method, txParams);
    }

    async splitCertificate(_certificateId: number, _energy: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.splitCertificate(_certificateId, _energy);

        return this.send(method, txParams);
    }

    async safeTransferFrom(_from: string, _to: string, _entityId: string, _data?: any, txParams?: ISpecialTx) {
        if (_data) {
            const method = this.web3Contract.methods.safeTransferFrom(_from, _to, _entityId, _data);

            return this.send(method, txParams);
        } else {
            const method = this.web3Contract.methods.safeTransferFrom(_from, _to, _entityId);

            return this.send(method, txParams);
        }
    }

    async userContractLookup(txParams?: ISpecialTx) {
        return this.web3Contract.methods.userContractLookup().call(txParams);
    }

    async db(txParams?: ISpecialTx) {
        return this.web3Contract.methods.db().call(txParams);
    }

    async getCertificate(_certificateId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getCertificate(_certificateId).call(txParams);
    }

    async ownerOf(_entityId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.ownerOf(_entityId).call(txParams);
    }

    async assetContractLookup(txParams?: ISpecialTx) {
        return this.web3Contract.methods.assetContractLookup().call(txParams);
    }

    async balanceOf(_owner: string, txParams?: ISpecialTx) {
        return this.web3Contract.methods.balanceOf(_owner).call(txParams);
    }

    async getTradableEntity(_entityId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getTradableEntity(_entityId).call(txParams);
    }

    async getCertificateOwner(_certificateId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getCertificateOwner(_certificateId).call(txParams);
    }

    async owner(txParams?: ISpecialTx) {
        return this.web3Contract.methods.owner().call(txParams);
    }

    async setApprovalForAll(_escrow: string, _approved: boolean, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.setApprovalForAll(_escrow, _approved);

        return this.send(method, txParams);
    }

    async changeOwner(_newOwner: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.changeOwner(_newOwner);

        return this.send(method, txParams);
    }

    async getCertificateListLength(txParams?: ISpecialTx) {
        return this.web3Contract.methods.getCertificateListLength().call(txParams);
    }

    async isRole(_role: number, _caller: string, txParams?: ISpecialTx) {
        return this.web3Contract.methods.isRole(_role, _caller).call(txParams);
    }

    async isRetired(_certificateId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.isRetired(_certificateId).call(txParams);
    }

    async retireCertificate(_certificateId: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.retireCertificate(_certificateId);

        return this.send(method, txParams);
    }

    async claimCertificateBulk(_idArray: number[], txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.claimCertificateBulk(_idArray);

        return this.send(method, txParams);
    }

    async isApprovedForAll(_owner: string, _operator: string, txParams?: ISpecialTx) {
        return this.web3Contract.methods.isApprovedForAll(_owner, _operator).call(txParams);
    }

    async init(_database: string, _admin: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.init(_database, _admin);

        return this.send(method, txParams);
    }
}
