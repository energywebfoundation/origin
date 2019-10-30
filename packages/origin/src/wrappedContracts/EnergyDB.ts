import { GeneralFunctions, ISpecialTx, ISearchLog } from '@energyweb/utils-general';
import Web3 from 'web3';
import EnergyDBJSON from '../../build/contracts/lightweight/EnergyDB.json';

export class EnergyDB extends GeneralFunctions {
    web3: Web3;

    constructor(web3: Web3, address?: string) {
        const buildFile: any = EnergyDBJSON;
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

    async createTradableEntityEntry(
        _assetId: number,
        _owner: string,
        _energy: number,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.createTradableEntityEntry(
            _assetId,
            _owner,
            _energy
        );

        return await this.send(method, txParams);
    }

    async getTradableEntity(_entityId: number, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.getTradableEntity(_entityId).call(txParams);
    }

    async owner(txParams?: ISpecialTx) {
        return await this.web3Contract.methods.owner().call(txParams);
    }

    async getBalanceOf(_owner: string, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.getBalanceOf(_owner).call(txParams);
    }

    async changeOwner(_newOwner: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.changeOwner(_newOwner);

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

    async setTradableEntity(_entityId: number, _entity: any, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.setTradableEntity(_entityId, _entity);

        return await this.send(method, txParams);
    }
}
