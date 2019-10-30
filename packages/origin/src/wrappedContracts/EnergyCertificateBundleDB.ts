import { GeneralFunctions, ISpecialTx, ISearchLog } from '@energyweb/utils-general';
import Web3 from 'web3';
import EnergyCertificateBundleDBJSON from '../../build/contracts/lightweight/EnergyCertificateBundleDB.json';

export class EnergyCertificateBundleDB extends GeneralFunctions {
    web3: Web3;

    constructor(web3: Web3, address?: string) {
        const buildFile: any = EnergyCertificateBundleDBJSON;
        super(
            address
                ? new web3.eth.Contract(buildFile.abi, address)
                : new web3.eth.Contract(
                    buildFile.abi,
                    buildFile.networks.length > 0
                        ? buildFile.networks[0]
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

    async getTradableEntityOwner(_entityId: number, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.getTradableEntityOwner(_entityId).call(txParams);
    }

    async getApproved(_entityId: number, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.getApproved(_entityId).call(txParams);
    }

    async getBundleListLength(txParams?: ISpecialTx) {
        return await this.web3Contract.methods.getBundleListLength().call(txParams);
    }

    async setDataLog(_certificateId: number, _newDataLog: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.setDataLog(_certificateId, _newDataLog);

        return await this.send(method, txParams);
    }

    async getOwnerChangeCounter(_certificateId: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.getOwnerChangeCounter(_certificateId);

        return await this.send(method, txParams);
    }

    async getBundle(_bundleID: number, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.getBundle(_bundleID).call(txParams);
    }

    async isRetired(_certificateId: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.isRetired(_certificateId);

        return await this.send(method, txParams);
    }

    async setTradableEntityOwnerAndAddApproval(
        _entityId: number,
        _owner: string,
        _approve: string,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.setTradableEntityOwnerAndAddApproval(
            _entityId,
            _owner,
            _approve
        );

        return await this.send(method, txParams);
    }

    async setOwnerChangeCounter(
        _certificateId: number,
        _newOwnerChangeCounter: number,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.setOwnerChangeCounter(
            _certificateId,
            _newOwnerChangeCounter
        );

        return await this.send(method, txParams);
    }

    async addApprovalExternal(_entityId: number, _approve: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.addApprovalExternal(_entityId, _approve);

        return await this.send(method, txParams);
    }

    async getOwnerToOperators(_company: string, _escrow: string, txParams?: ISpecialTx) {
        return await this.web3Contract.methods
            .getOwnerToOperators(_company, _escrow)
            .call(txParams);
    }

    async setTradableEntityOwnerExternal(_entityId: number, _owner: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.setTradableEntityOwnerExternal(_entityId, _owner);

        return await this.send(method, txParams);
    }

    async getTradableEntity(_entityId: number, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.getTradableEntity(_entityId).call(txParams);
    }

    async addChildrenExternal(_certificateId: number, _childId: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.addChildrenExternal(_certificateId, _childId);

        return await this.send(method, txParams);
    }

    async owner(txParams?: ISpecialTx) {
        return await this.web3Contract.methods.owner().call(txParams);
    }

    async getCertificateSpecific(_certificateId: number, txParams?: ISpecialTx) {
        return await this.web3Contract.methods
            .getCertificateSpecific(_certificateId)
            .call(txParams);
    }

    async getBalanceOf(_owner: string, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.getBalanceOf(_owner).call(txParams);
    }

    async retire(_certificateId: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.setStatus(_certificateId, 1);

        return await this.send(method, txParams);
    }

    async setMaxOwnerChanges(
        _certificateId: number,
        _newMaxOwnerChanges: number,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.setMaxOwnerChanges(
            _certificateId,
            _newMaxOwnerChanges
        );

        return await this.send(method, txParams);
    }

    async changeOwner(_newOwner: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.changeOwner(_newOwner);

        return await this.send(method, txParams);
    }

    async getMaxOwnerChanges(_certificateId: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.getMaxOwnerChanges(_certificateId);

        return await this.send(method, txParams);
    }

    async addChildren(_certificateId: number, _childId: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.addChildren(_certificateId, _childId);

        return await this.send(method, txParams);
    }

    async setCertificateSpecific(_certificateId: number, _certificate: any, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.setCertificateSpecific(
            _certificateId,
            _certificate
        );

        return await this.send(method, txParams);
    }

    async setOwnerToOperators(
        _company: string,
        _escrow: string,
        _allowed: boolean,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.setOwnerToOperators(_company, _escrow, _allowed);

        return await this.send(method, txParams);
    }

    async getCertificateChildrenLength(_certificateId: number, txParams?: ISpecialTx) {
        return await this.web3Contract.methods
            .getCertificateChildrenLength(_certificateId)
            .call(txParams);
    }

    async setTradableEntity(_entityId: number, _entity: any, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.setTradableEntity(_entityId, _entity);

        return await this.send(method, txParams);
    }

    async getDataLog(_certificateId: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.getDataLog(_certificateId);

        return await this.send(method, txParams);
    }

    async createEnergyCertificateBundle(
        _tradableEntity: any,
        _certificateSpecific: any,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.createEnergyCertificateBundle(
            _tradableEntity,
            _certificateSpecific
        );

        return await this.send(method, txParams);
    }
}
