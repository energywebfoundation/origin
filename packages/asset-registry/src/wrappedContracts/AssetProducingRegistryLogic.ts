import { GeneralFunctions, ISpecialTx, ISearchLog, getClientVersion } from '@energyweb/utils-general';
import Web3 from 'web3';
import AssetProducingRegistryLogicJSON from '../../build/contracts/lightweight/AssetProducingRegistryLogic.json';
import moment from 'moment';

export class AssetProducingRegistryLogic extends GeneralFunctions {
    web3: Web3;

    constructor(web3: Web3, address?: string) {
        const buildFile: any = AssetProducingRegistryLogicJSON;
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

    async getAllLogNewMeterReadEvents(eventFilter?: ISearchLog) {
        return await this.web3Contract.getPastEvents('LogNewMeterRead', eventFilter);
    }

    async getAllLogAssetCreatedEvents(eventFilter?: ISearchLog) {
        return await this.web3Contract.getPastEvents('LogAssetCreated', eventFilter);
    }

    async getAllLogAssetFullyInitializedEvents(eventFilter?: ISearchLog) {
        return await this.web3Contract.getPastEvents('LogAssetFullyInitialized', eventFilter);
    }

    async getAllLogAssetSetActiveEvents(eventFilter?: ISearchLog) {
        return await this.web3Contract.getPastEvents('LogAssetSetActive', eventFilter);
    }

    async getAllLogAssetSetInactiveEvents(eventFilter?: ISearchLog) {
        return await this.web3Contract.getPastEvents('LogAssetSetInactive', eventFilter);
    }

    async getSmartMeterReadsForAsset(_assetId: number, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.getSmartMeterReadsForAsset(_assetId).call(txParams);
    }

    async getAllLogChangeOwnerEvents(eventFilter?: ISearchLog) {
        return await this.web3Contract.getPastEvents('LogChangeOwner', eventFilter);
    }

    async getAllEvents(eventFilter?: ISearchLog) {
        return await this.web3Contract.getPastEvents('allEvents', eventFilter);
    }

    async update(_newLogic: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.update(_newLogic);

        return await this.send(method, txParams);
    }

    async getLastMeterReadingAndHash(_assetId: number, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.getLastMeterReadingAndHash(_assetId).call(txParams);
    }

    async getAssetBySmartMeter(_smartMeter: string, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.getAssetBySmartMeter(_smartMeter).call(txParams);
    }

    async userContractLookup(txParams?: ISpecialTx) {
        return await this.web3Contract.methods.userContractLookup().call(txParams);
    }

    async checkAssetExist(_smartMeter: string, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.checkAssetExist(_smartMeter).call(txParams);
    }

    async db(txParams?: ISpecialTx) {
        return await this.web3Contract.methods.db().call(txParams);
    }

    async createAsset(
        _smartMeter: string,
        _owner: string,
        _active: boolean,
        _propertiesDocumentHash: string,
        _url: string,
        _numOwnerChanges: number,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.createAsset(
            _smartMeter,
            _owner,
            _active,
            _propertiesDocumentHash,
            _url,
            _numOwnerChanges
        );

        return await this.send(method, txParams);
    }

    async setMarketLookupContract(
        _assetId: number,
        _marketContractLookup: string,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.setMarketLookupContract(
            _assetId,
            _marketContractLookup
        );

        return await this.send(method, txParams);
    }

    async getAssetOwner(_assetId: number, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.getAssetOwner(_assetId).call(txParams);
    }

    async owner(txParams?: ISpecialTx) {
        return await this.web3Contract.methods.owner().call(txParams);
    }

    async changeOwner(_newOwner: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.changeOwner(_newOwner);

        return await this.send(method, txParams);
    }

    async checkAssetExistExternal(_smartMeter: string, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.checkAssetExistExternal(_smartMeter).call(txParams);
    }

    async setBundleActive(_assetId: number, _active: boolean, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.setBundleActive(_assetId, _active);

        return await this.send(method, txParams);
    }

    async saveSmartMeterRead(
        _assetId: number,
        _newMeterRead: number,
        _lastSmartMeterReadFileHash: string,
        _timestamp: number = moment().unix(),
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.saveSmartMeterRead(
            _assetId,
            _newMeterRead,
            _lastSmartMeterReadFileHash,
            _timestamp
        );

        return await this.send(method, txParams);
    }

    async getAssetGeneral(_assetId: number, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.getAssetGeneral(_assetId).call(txParams);
    }

    async getAssetListLength(txParams?: ISpecialTx) {
        return await this.web3Contract.methods.getAssetListLength().call(txParams);
    }

    async getAssetById(_assetId: number, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.getAssetById(_assetId).call(txParams);
    }

    async isRole(_role: number, _caller: string, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.isRole(_role, _caller).call(txParams);
    }

    async getMarketLookupContract(_assetId: number, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.getMarketLookupContract(_assetId).call(txParams);
    }

    async setActive(_assetId: number, _active: boolean, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.setActive(_assetId, _active);

        return await this.send(method, txParams);
    }

    async init(_dbAddress: string, param1: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.init(_dbAddress, param1);

        return await this.send(method, txParams);
    }
}
