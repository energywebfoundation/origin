import { GeneralFunctions, SpecialTx, SearchLog } from './GeneralFunctions';
import Web3 from 'web3';
import EnergyCertificateBundleDBJSON from '../../build/contracts/lightweight/EnergyCertificateBundleDB.json';

export class EnergyCertificateBundleDB extends GeneralFunctions {
    web3: Web3;
    buildFile = EnergyCertificateBundleDBJSON;

    constructor(web3: Web3, address?: string) {
        super(
            address
                ? new web3.eth.Contract(EnergyCertificateBundleDBJSON.abi, address)
                : new web3.eth.Contract(
                      EnergyCertificateBundleDBJSON.abi,
                      (EnergyCertificateBundleDBJSON as any).networks.length > 0
                          ? EnergyCertificateBundleDBJSON.networks[0]
                          : null
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

    async getTradableEntityOwner(_entityId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getTradableEntityOwner(_entityId).call(txParams);
    }

    async getApproved(_entityId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getApproved(_entityId).call(txParams);
    }

    async getBundleListLength(txParams?: SpecialTx) {
        return await this.web3Contract.methods.getBundleListLength().call(txParams);
    }

    async setDataLog(_certificateId: number, _newDataLog: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.setDataLog(_certificateId, _newDataLog);

        return await this.send(method, txParams);
    }

    async getOwnerChangeCounter(_certificateId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.getOwnerChangeCounter(_certificateId);

        return await this.send(method, txParams);
    }

    async getBundle(_bundleID: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getBundle(_bundleID).call(txParams);
    }

    async isRetired(_certificateId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.isRetired(_certificateId);

        return await this.send(method, txParams);
    }

    async setTradableEntityOwnerAndAddApproval(
        _entityId: number,
        _owner: string,
        _approve: string,
        txParams?: SpecialTx
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
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.setOwnerChangeCounter(
            _certificateId,
            _newOwnerChangeCounter
        );

        return await this.send(method, txParams);
    }

    async addApprovalExternal(_entityId: number, _approve: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.addApprovalExternal(_entityId, _approve);

        return await this.send(method, txParams);
    }

    async setOnChainDirectPurchasePrice(_entityId: number, _price: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.setOnChainDirectPurchasePrice(_entityId, _price);

        return await this.send(method, txParams);
    }

    async getOwnerToOperators(_company: string, _escrow: string, txParams?: SpecialTx) {
        return await this.web3Contract.methods
            .getOwnerToOperators(_company, _escrow)
            .call(txParams);
    }

    async setTradableEntityOwnerExternal(_entityId: number, _owner: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.setTradableEntityOwnerExternal(_entityId, _owner);

        return await this.send(method, txParams);
    }

    async getTradableEntity(_entityId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getTradableEntity(_entityId).call(txParams);
    }

    async addChildrenExternal(_certificateId: number, _childId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.addChildrenExternal(_certificateId, _childId);

        return await this.send(method, txParams);
    }

    async owner(txParams?: SpecialTx) {
        return await this.web3Contract.methods.owner().call(txParams);
    }

    async getCertificateSpecific(_certificateId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods
            .getCertificateSpecific(_certificateId)
            .call(txParams);
    }

    async getBalanceOf(_owner: string, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getBalanceOf(_owner).call(txParams);
    }

    async retire(_certificateId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.setStatus(_certificateId, 1);

        return await this.send(method, txParams);
    }

    async setMaxOwnerChanges(
        _certificateId: number,
        _newMaxOwnerChanges: number,
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.setMaxOwnerChanges(
            _certificateId,
            _newMaxOwnerChanges
        );

        return await this.send(method, txParams);
    }

    async changeOwner(_newOwner: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.changeOwner(_newOwner);

        return await this.send(method, txParams);
    }

    async getMaxOwnerChanges(_certificateId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.getMaxOwnerChanges(_certificateId);

        return await this.send(method, txParams);
    }

    async removeTokenAndPrice(_entityId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.removeTokenAndPrice(_entityId);

        return await this.send(method, txParams);
    }

    async addChildren(_certificateId: number, _childId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.addChildren(_certificateId, _childId);

        return await this.send(method, txParams);
    }

    async setCertificateSpecific(_certificateId: number, _certificate: any, txParams?: SpecialTx) {
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
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.setOwnerToOperators(_company, _escrow, _allowed);

        return await this.send(method, txParams);
    }

    async getCertificateChildrenLength(_certificateId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods
            .getCertificateChildrenLength(_certificateId)
            .call(txParams);
    }

    async publishForSale(
        _entityId: number,
        _price: number,
        _tokenAddress: string,
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.publishForSale(_entityId, _price, _tokenAddress);

        return await this.send(method, txParams);
    }

    async unpublishForSale(_entityId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.unpublishForSale(_entityId);

        return await this.send(method, txParams);
    }

    async setTradableEntity(_entityId: number, _entity: any, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.setTradableEntity(_entityId, _entity);

        return await this.send(method, txParams);
    }

    async setTradableToken(_entityId: number, _token: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.setTradableToken(_entityId, _token);

        return await this.send(method, txParams);
    }

    async getOnChainDirectPurchasePrice(_entityId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods
            .getOnChainDirectPurchasePrice(_entityId)
            .call(txParams);
    }

    async getDataLog(_certificateId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.getDataLog(_certificateId);

        return await this.send(method, txParams);
    }

    async getTradableToken(_entityId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getTradableToken(_entityId).call(txParams);
    }

    async createEnergyCertificateBundle(
        _tradableEntity: any,
        _certificateSpecific: any,
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.createEnergyCertificateBundle(
            _tradableEntity,
            _certificateSpecific
        );

        return await this.send(method, txParams);
    }
}
