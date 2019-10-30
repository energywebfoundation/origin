import { ISpecialTx, ISearchLog } from '@energyweb/utils-general';
import Web3 from 'web3';

import EnergyCertificateBundleLogicJSON from '../../build/contracts/lightweight/EnergyCertificateBundleLogic.json';
import { CertificateSpecificContract } from './CertificateSpecificContract';

export class EnergyCertificateBundleLogic extends CertificateSpecificContract {
    web3: Web3;

    constructor(web3: Web3, address?: string) {
        const buildFile: any = EnergyCertificateBundleLogicJSON;
        super(web3, address);

        this.web3Contract = address
            ? new web3.eth.Contract(buildFile.abi, address)
            : new web3.eth.Contract(
                buildFile.abi,
                buildFile.networks.length > 0
                    ? buildFile.networks[0]
                    : null
            );
        this.web3 = web3;
    }

    async getAllLogCreatedBundleEvents(eventFilter?: ISearchLog) {
        return await this.web3Contract.getPastEvents('LogCreatedBundle', eventFilter);
    }

    async getAllLogBundleRetiredEvents(eventFilter?: ISearchLog) {
        return await this.web3Contract.getPastEvents('LogBundleRetired', eventFilter);
    }

    async getAllLogBundleOwnerChangedEvents(eventFilter?: ISearchLog) {
        return await this.web3Contract.getPastEvents('LogBundleOwnerChanged', eventFilter);
    }

    async getAllTransferEvents(eventFilter?: ISearchLog) {
        return await this.web3Contract.getPastEvents('Transfer', eventFilter);
    }

    async getAllApprovalEvents(eventFilter?: ISearchLog) {
        return await this.web3Contract.getPastEvents('Approval', eventFilter);
    }

    async getAllApprovalForAllEvents(eventFilter?: ISearchLog) {
        return await this.web3Contract.getPastEvents('ApprovalForAll', eventFilter);
    }

    async getAllLogChangeOwnerEvents(eventFilter?: ISearchLog) {
        return await this.web3Contract.getPastEvents('LogChangeOwner', eventFilter);
    }

    async getAllEvents(eventFilter?: ISearchLog) {
         return await this.web3Contract.getPastEvents('allEvents', eventFilter);
    }

    async supportsInterface(_interfaceID: string, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.supportsInterface(_interfaceID).call(txParams);
    }

    async getApproved(_tokenId: number, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.getApproved(_tokenId).call(txParams);
    }

    async approve(_approved: string, _entityId: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.approve(_approved, _entityId);

        return await this.send(method, txParams);
    }

    async getBundleListLength(txParams?: ISpecialTx) {
        return await this.web3Contract.methods.getBundleListLength().call(txParams);
    }

    async update(_newLogic: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.update(_newLogic);

        return await this.send(method, txParams);
    }

    async transferFrom(_from: string, _to: string, _entityId: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.transferFrom(_from, _to, _entityId);

        return await this.send(method, txParams);
    }

    async getBundle(_bundleId: number, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.getBundle(_bundleId).call(txParams);
    }

    async createTradableEntity(_assetId: number, _energy: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.createTradableEntity(_assetId, _energy);

        return await this.send(method, txParams);
    }

    async safeTransferFrom(_from: string, _to: string, _entityId: string, _data?: any, txParams?: ISpecialTx) {
        if (_data) {
            const method = this.web3Contract.methods.safeTransferFrom(_from, _to, _entityId, _data);

            return await this.send(method, txParams);
        } else {
            const method = this.web3Contract.methods.safeTransferFrom(_from, _to, _entityId);

            return await this.send(method, txParams);
        }
    }

    async userContractLookup(txParams?: ISpecialTx) {
        return await this.web3Contract.methods.userContractLookup().call(txParams);
    }

    async db(txParams?: ISpecialTx) {
        return await this.web3Contract.methods.db().call(txParams);
    }

    async ownerOf(_entityId: number, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.ownerOf(_entityId).call(txParams);
    }

    async assetContractLookup(txParams?: ISpecialTx) {
        return await this.web3Contract.methods.assetContractLookup().call(txParams);
    }

    async balanceOf(_owner: string, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.balanceOf(_owner).call(txParams);
    }

    async getTradableEntity(_entityId: number, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.getTradableEntity(_entityId).call(txParams);
    }

    async owner(txParams?: ISpecialTx) {
        return await this.web3Contract.methods.owner().call(txParams);
    }

    async getBundleOwner(_bundleId: number, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.getBundleOwner(_bundleId).call(txParams);
    }

    async setApprovalForAll(_escrow: string, _approved: boolean, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.setApprovalForAll(_escrow, _approved);

        return await this.send(method, txParams);
    }

    async changeOwner(_newOwner: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.changeOwner(_newOwner);

        return await this.send(method, txParams);
    }

    async retireBundle(_bundleId: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.retireBundle(_bundleId);

        return await this.send(method, txParams);
    }

    async isRole(_role: number, _caller: string, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.isRole(_role, _caller).call(txParams);
    }

    async isRetired(_bundleId: number, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.isRetired(_bundleId).call(txParams);
    }

    async isApprovedForAll(_owner: string, _operator: string, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.isApprovedForAll(_owner, _operator).call(txParams);
    }

    async init(_database: string, _admin: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.init(_database, _admin);

        return await this.send(method, txParams);
    }
}
