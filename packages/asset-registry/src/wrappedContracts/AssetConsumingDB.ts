import { GeneralFunctions, ISpecialTx, ISearchLog } from '@energyweb/utils-general';
import Web3 from 'web3';
import AssetConsumingDBJSON from '../../build/contracts/lightweight/AssetConsumingDB.json';

export class AssetConsumingDB extends GeneralFunctions {
    web3: Web3;

    constructor(web3: Web3, address?: string) {
        const buildFile: any = AssetConsumingDBJSON;
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

    async getLastSmartMeterReadWh(_assetId: number, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.getLastSmartMeterReadWh(_assetId).call(txParams);
    }

    async getIsBundled(_assetId: number, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.getIsBundled(_assetId).call(txParams);
    }

    async getLastMeterReadingAndHash(_assetId: number, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.getLastMeterReadingAndHash(_assetId).call(txParams);
    }

    async getAssetBySmartMeter(_smartMeter: string, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.getAssetBySmartMeter(_smartMeter).call(txParams);
    }

    async setIsBundled(_assetId: number, _bundled: boolean, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.setIsBundled(_assetId, _bundled);

        return await this.send(method, txParams);
    }

    async setAssetOwner(_assetId: number, _owner: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.setAssetOwner(_assetId, _owner);
        const transactionParams = await this.buildTransactionParams(method, txParams);

        return await this.send(method, txParams);
    }

    async setLastSmartMeterReadWh(
        _assetId: number,
        _lastSmartMeterReadWh: number,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.setLastSmartMeterReadWh(
            _assetId,
            _lastSmartMeterReadWh
        );

        return await this.send(method, txParams);
    }

    async setLastSmartMeterReadFileHash(
        _assetId: number,
        _lastSmartMeterReadFileHash: string,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.setLastSmartMeterReadFileHash(
            _assetId,
            _lastSmartMeterReadFileHash
        );

        return await this.send(method, txParams);
    }

    async setMarketLookupContract(
        _assetId: number,
        _marketLookupContract: string,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.setMarketLookupContract(
            _assetId,
            _marketLookupContract
        );

        return await this.send(method, txParams);
    }

    async setSmartMeterRead(
        _assetId: number,
        _lastSmartMeterReadWh: number,
        _lastSmartMeterReadFileHash: string,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.setSmartMeterRead(
            _assetId,
            _lastSmartMeterReadWh,
            _lastSmartMeterReadFileHash
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

    async getAssetGeneral(_assetId: number, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.getAssetGeneral(_assetId).call(txParams);
    }

    async getAssetListLength(txParams?: ISpecialTx) {
        return await this.web3Contract.methods.getAssetListLength().call(txParams);
    }

    async getAssetById(_assetId: number, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.getAssetById(_assetId).call(txParams);
    }

    async addFullAsset(_a: any, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.addFullAsset(_a);

        return await this.send(method, txParams);
    }

    async getActive(_assetId: number, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.getActive(_assetId).call(txParams);
    }

    async getMarketLookupContract(_assetId: number, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.getMarketLookupContract(_assetId).call(txParams);
    }

    async setActive(_assetId: number, _active: boolean, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.setActive(_assetId, _active);

        return await this.send(method, txParams);
    }

    async getSmartMeter(_assetId: number, txParams?: ISpecialTx) {
        return await this.web3Contract.methods.getSmartMeter(_assetId).call(txParams);
    }

    async getLastSmartMeterReadFileHash(_assetId: number, txParams?: ISpecialTx) {
        return await this.web3Contract.methods
            .getLastSmartMeterReadFileHash(_assetId)
            .call(txParams);
    }
}
