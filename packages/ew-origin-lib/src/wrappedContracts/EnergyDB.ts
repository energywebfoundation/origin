import { GeneralFunctions, SpecialTx, SearchLog } from './GeneralFunctions';
import Web3 = require('web3');
import EnergyDBJSON from '../../build/contracts/EnergyDB.json';

export class EnergyDB extends GeneralFunctions {
    web3: Web3;
    buildFile = EnergyDBJSON;

    constructor(web3: Web3, address?: string) {
        super(
            address
                ? new web3.eth.Contract(EnergyDBJSON.abi, address)
                : new web3.eth.Contract(
                      EnergyDBJSON.abi,
                      (EnergyDBJSON as any).networks.length > 0 ? EnergyDBJSON.networks[0] : null
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

        return await this.send(method, txParams);
    }

    async setTradableEntityEscrowExternal(
        _entityId: number,
        _escrow: string[],
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.setTradableEntityEscrowExternal(
            _entityId,
            _escrow
        );

        return await this.send(method, txParams);
    }

    async getTradableEntityEscrowLength(_entityId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods
            .getTradableEntityEscrowLength(_entityId)
            .call(txParams);
    }

    async addEscrowForAsset(_entityId: number, _escrow: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.addEscrowForAsset(_entityId, _escrow);

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

    async addApprovalExternal(_entityId: number, _approve: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.addApprovalExternal(_entityId, _approve);

        return await this.send(method, txParams);
    }

    async setOnChainDirectPurchasePrice(_entityId: number, _price: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.setOnChainDirectPurchasePrice(_entityId, _price);

        return await this.send(method, txParams);
    }

    async setEscrow(_entityId: number, _escrow: string[], txParams?: SpecialTx) {
        const method = this.web3Contract.methods.setEscrow(_entityId, _escrow);

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

    async createTradableEntityEntry(
        _assetId: number,
        _owner: string,
        _powerInW: number,
        _acceptedToken: string,
        _onChainDirectPurchasePrice: number,
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.createTradableEntityEntry(
            _assetId,
            _owner,
            _powerInW,
            _acceptedToken,
            _onChainDirectPurchasePrice
        );

        return await this.send(method, txParams);
    }

    async getTradableEntity(_entityId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getTradableEntity(_entityId).call(txParams);
    }

    async owner(txParams?: SpecialTx) {
        return await this.web3Contract.methods.owner().call(txParams);
    }

    async getBalanceOf(_owner: string, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getBalanceOf(_owner).call(txParams);
    }

    async changeOwner(_newOwner: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.changeOwner(_newOwner);

        return await this.send(method, txParams);
    }

    async removeTokenAndPrice(_entityId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.removeTokenAndPrice(_entityId);

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

    async removeEscrow(_entityId: number, _escrow: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.removeEscrow(_entityId, _escrow);

        return await this.send(method, txParams);
    }

    async publishForSale(_entityId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.publishForSale(_entityId);

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

    async getTradableToken(_entityId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getTradableToken(_entityId).call(txParams);
    }
}
