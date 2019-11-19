import { GeneralFunctions, ISpecialTx } from '@energyweb/utils-general';
import { PastEventOptions } from 'web3-eth-contract';
import Web3 from 'web3';
import moment from 'moment';
import AssetLogicJSON from '../../build/contracts/lightweight/AssetLogic.json';
import { UsageType } from '../blockchain-facade/Asset';

export class AssetLogic extends GeneralFunctions {
    web3: Web3;

    constructor(web3: Web3, address?: string) {
        const buildFile: any = AssetLogicJSON;
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

    async initialize(userContractAddress: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.initialize(userContractAddress);

        return this.send(method, txParams);
    }

    async getAllLogNewMeterReadEvents(eventFilter?: PastEventOptions) {
        return this.web3Contract.getPastEvents('LogNewMeterRead', eventFilter);
    }

    async getAllLogAssetCreatedEvents(eventFilter?: PastEventOptions) {
        return this.web3Contract.getPastEvents('LogAssetCreated', eventFilter);
    }

    async getAllLogAssetFullyInitializedEvents(eventFilter?: PastEventOptions) {
        return this.web3Contract.getPastEvents('LogAssetFullyInitialized', eventFilter);
    }

    async getAllLogAssetSetActiveEvents(eventFilter?: PastEventOptions) {
        return this.web3Contract.getPastEvents('LogAssetSetActive', eventFilter);
    }

    async getAllLogAssetSetInactiveEvents(eventFilter?: PastEventOptions) {
        return this.web3Contract.getPastEvents('LogAssetSetInactive', eventFilter);
    }

    async getSmartMeterReadsForAssetByIndex(
        _assetId: number,
        _indexes: number[],
        txParams?: ISpecialTx
    ) {
        return this.web3Contract.methods
            .getSmartMeterReadsForAssetByIndex(_assetId, _indexes)
            .call(txParams);
    }

    async getSmartMeterReadsForAsset(_assetId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getSmartMeterReadsForAsset(_assetId).call(txParams);
    }

    async getAllLogChangeOwnerEvents(eventFilter?: PastEventOptions) {
        return this.web3Contract.getPastEvents('LogChangeOwner', eventFilter);
    }

    async getAllEvents(eventFilter?: PastEventOptions) {
        return this.web3Contract.getPastEvents('allEvents', eventFilter);
    }

    async getLastMeterReadingAndHash(_assetId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getLastMeterReadingAndHash(_assetId).call(txParams);
    }

    async getAssetBySmartMeter(_smartMeter: string, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getAssetBySmartMeter(_smartMeter).call(txParams);
    }

    async checkAssetExist(_smartMeter: string, txParams?: ISpecialTx) {
        return this.web3Contract.methods.checkAssetExist(_smartMeter).call(txParams);
    }

    async createAsset(
        _smartMeter: string,
        _owner: string,
        _active: boolean,
        _usageType: UsageType,
        _propertiesDocumentHash: string,
        _url: string,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.createAsset(
            _smartMeter,
            _owner,
            _active,
            _usageType,
            _propertiesDocumentHash,
            _url
        );

        return this.send(method, txParams);
    }

    async getAssetOwner(_assetId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getAssetOwner(_assetId).call(txParams);
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

        return this.send(method, txParams);
    }

    async getAssetListLength(txParams?: ISpecialTx) {
        return this.web3Contract.methods.getAssetListLength().call(txParams);
    }

    async getAsset(_assetId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getAsset(_assetId).call(txParams);
    }

    async getAssetById(_assetId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getAssetById(_assetId).call(txParams);
    }

    async isRole(_role: number, _caller: string, txParams?: ISpecialTx) {
        return this.web3Contract.methods.isRole(_role, _caller).call(txParams);
    }

    async setActive(_assetId: number, _active: boolean, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.setActive(_assetId, _active);

        return this.send(method, txParams);
    }

    async userLogicAddress(txParams?: ISpecialTx) {
        return this.web3Contract.methods.userLogicAddress().call(txParams);
    }
}
