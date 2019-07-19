import { GeneralFunctions, SpecialTx, SearchLog } from './GeneralFunctions';
import Web3 = require('web3');
import EnergyCertificateBundleDBJSON from '../../build/contracts/EnergyCertificateBundleDB.json';

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

    async addEscrowForEntity(_entityId: number, _escrow: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.addEscrowForEntity(_entityId, _escrow);
        const transactionParams = await this.buildTransactionParams(method, txParams);

        return await this.send(method, transactionParams);
    }

    async setTradableEntityEscrowExternal(
        _entityId: number,
        _escrow: string[],
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.setTradableEntityEscrowExternal(_entityId, _escrow);
        const transactionParams = await this.buildTransactionParams(method, txParams);

        return await this.send(method, transactionParams);
    }

    async getTradableEntityEscrowLength(_entityId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods
            .getTradableEntityEscrowLength(_entityId)
            .call(txParams);
    }

    async getBundleListLength(txParams?: SpecialTx) {
        return await this.web3Contract.methods.getBundleListLength().call(txParams);
    }

    async setDataLog(_certificateId: number, _newDataLog: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.setDataLog(_certificateId, _newDataLog);
        const transactionParams = await this.buildTransactionParams(method, txParams);

        return await this.send(method, transactionParams);
    }

    async getOwnerChangeCounter(_certificateId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.getOwnerChangeCounter(_certificateId);
        const transactionParams = await this.buildTransactionParams(method, txParams);
    
        return await this.send(method, transactionParams);
    }

    async getBundle(_bundleID: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getBundle(_bundleID).call(txParams);
    }

    async isRetired(_certificateId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.isRetired(_certificateId);
        const transactionParams = await this.buildTransactionParams(method, txParams);
    
        return await this.send(method, transactionParams);
    }

    async setTradableEntityOwnerAndAddApproval(
        _entityId: number,
        _owner: string,
        _approve: string,
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.setTradableEntityOwnerAndAddApproval(_entityId, _owner, _approve);
        const transactionParams = await this.buildTransactionParams(method, txParams);
        
        return await this.send(method, transactionParams);
    }

    async setOwnerChangeCounter(
        _certificateId: number,
        _newOwnerChangeCounter: number,
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.setOwnerChangeCounter(_certificateId, _newOwnerChangeCounter);
        const transactionParams = await this.buildTransactionParams(method, txParams);
            
        return await this.send(method, transactionParams);
    }

    async addApprovalExternal(_entityId: number, _approve: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.addApprovalExternal(_entityId, _approve);
        const transactionParams = await this.buildTransactionParams(method, txParams);
                
        return await this.send(method, transactionParams);
    }

    async setOnChainDirectPurchasePrice(_entityId: number, _price: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.setOnChainDirectPurchasePrice(_entityId, _price);
        const transactionParams = await this.buildTransactionParams(method, txParams);
            
        return await this.send(method, transactionParams);
    }

    async getOwnerToOperators(_company: string, _escrow: string, txParams?: SpecialTx) {
        return await this.web3Contract.methods
            .getOwnerToOperators(_company, _escrow)
            .call(txParams);
    }

    async setTradableEntityOwnerExternal(_entityId: number, _owner: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.setTradableEntityOwnerExternal(_entityId, _owner);
        const transactionParams = await this.buildTransactionParams(method, txParams);
            
        return await this.send(method, transactionParams);
    }

    async getTradableEntity(_entityId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getTradableEntity(_entityId).call(txParams);
    }

    async addChildrenExternal(_certificateId: number, _childId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.addChildrenExternal(_certificateId, _childId);
        const transactionParams = await this.buildTransactionParams(method, txParams);
                
        return await this.send(method, transactionParams);
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
        const transactionParams = await this.buildTransactionParams(method, txParams);
                
        return await this.send(method, transactionParams);
    }

    async setMaxOwnerChanges(
        _certificateId: number,
        _newMaxOwnerChanges: number,
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.setMaxOwnerChanges(_certificateId, _newMaxOwnerChanges);
        const transactionParams = await this.buildTransactionParams(method, txParams);
            
        return await this.send(method, transactionParams);
    }

    async changeOwner(_newOwner: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.changeOwner(_newOwner);
        const transactionParams = await this.buildTransactionParams(method, txParams);
            
        return await this.send(method, transactionParams);
    }

    async getMaxOwnerChanges(_certificateId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.getMaxOwnerChanges(_certificateId);
        const transactionParams = await this.buildTransactionParams(method, txParams);
                
        return await this.send(method, transactionParams);
    }

    async removeTokenAndPrice(_entityId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.removeTokenAndPrice(_entityId);
        const transactionParams = await this.buildTransactionParams(method, txParams);
            
        return await this.send(method, transactionParams);
    }

    async addChildren(_certificateId: number, _childId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.addChildren(_certificateId, _childId);
        const transactionParams = await this.buildTransactionParams(method, txParams);
            
        return await this.send(method, transactionParams);
    }

    async setCertificateSpecific(_certificateId: number, _certificate: any, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.setCertificateSpecific(_certificateId, _certificate);
        const transactionParams = await this.buildTransactionParams(method, txParams);
                
        return await this.send(method, transactionParams);
    }

    async setOwnerToOperators(
        _company: string,
        _escrow: string,
        _allowed: boolean,
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.setOwnerToOperators(_company, _escrow, _allowed);
        const transactionParams = await this.buildTransactionParams(method, txParams);
                
        return await this.send(method, transactionParams);
    }

    async getCertificateChildrenLength(_certificateId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods
            .getCertificateChildrenLength(_certificateId)
            .call(txParams);
    }

    async removeEscrow(_entityId: number, _escrow: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.removeEscrow(_entityId, _escrow);
        const transactionParams = await this.buildTransactionParams(method, txParams);
            
        return await this.send(method, transactionParams);
    }

    async publishForSale(_entityId: number, _price: number, _tokenAddress: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.publishForSale(_entityId, _price, _tokenAddress);
        const transactionParams = await this.buildTransactionParams(method, txParams);
            
        return await this.send(method, transactionParams);
    }

    async unpublishForSale(_entityId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.unpublishForSale(_entityId);
        const transactionParams = await this.buildTransactionParams(method, txParams);
            
        return await this.send(method, transactionParams);
    }

    async setTradableEntity(_entityId: number, _entity: any, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.setTradableEntity(_entityId, _entity);
        const transactionParams = await this.buildTransactionParams(method, txParams);
            
        return await this.send(method, transactionParams);
    }

    async setTradableToken(_entityId: number, _token: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.setTradableToken(_entityId, _token)
        const transactionParams = await this.buildTransactionParams(method, txParams);
                
        return await this.send(method, transactionParams);
    }

    async getOnChainDirectPurchasePrice(_entityId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods
            .getOnChainDirectPurchasePrice(_entityId)
            .call(txParams);
    }

    async getDataLog(_certificateId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.getDataLog(_certificateId);
        const transactionParams = await this.buildTransactionParams(method, txParams);
            
        return await this.send(method, transactionParams);
    }

    async getTradableToken(_entityId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getTradableToken(_entityId).call(txParams);
    }

    async createEnergyCertificateBundle(
        _tradableEntity: any,
        _certificateSpecific: any,
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.createEnergyCertificateBundle(_tradableEntity, _certificateSpecific);
        const transactionParams = await this.buildTransactionParams(method, txParams);
            
        return await this.send(method, transactionParams);
    }
}
