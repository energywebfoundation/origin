import { GeneralFunctions, SpecialTx, SearchLog, getClientVersion } from './GeneralFunctions';
import Web3 = require('web3');
import AssetProducingDBJSON from '../../build/contracts/AssetProducingDB.json';

export class AssetProducingDB extends GeneralFunctions {
    web3: Web3;
    buildFile = AssetProducingDBJSON;

    constructor(web3: Web3, address?: string) {
        super(
            address
                ? new web3.eth.Contract(AssetProducingDBJSON.abi, address)
                : new web3.eth.Contract(
                      AssetProducingDBJSON.abi,
                      (AssetProducingDBJSON as any).networks.length > 0
                          ? AssetProducingDBJSON.networks[0]
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

    async getLastSmartMeterReadWh(_assetId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getLastSmartMeterReadWh(_assetId).call(txParams);
    }

    async getIsBundled(_assetId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getIsBundled(_assetId).call(txParams);
    }

    async getLastMeterReadingAndHash(_assetId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getLastMeterReadingAndHash(_assetId).call(txParams);
    }

    async getAssetBySmartMeter(_smartMeter: string, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getAssetBySmartMeter(_smartMeter).call(txParams);
    }

    async setIsBundled(_assetId: number, _bundled: boolean, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.setIsBundled(_assetId, _bundled);

        return await this.send(method, txParams);
    }

    async setAssetOwner(_assetId: number, _owner: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.setAssetOwner(_assetId, _owner);

        return await this.send(method, txParams);
    }

    async setLastSmartMeterReadWh(
        _assetId: number,
        _lastSmartMeterReadWh: number,
        txParams?: SpecialTx
    ) {
        const method =  this.web3Contract.methods.setLastSmartMeterReadWh(_assetId, _lastSmartMeterReadWh);

        return await this.send(method, txParams);
    }

    async addMatcher(_assetId: number, _matcher: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.addMatcher(_assetId, _matcher);

        return await this.send(method, txParams);
    }

    async setMatcherExternal(_assetId: number, _matcher: string[], txParams?: SpecialTx) {
        const method = await this.web3Contract.methods.setMatcherExternal(_assetId, _matcher);

        return await this.send(method, txParams);
    }

    async removeMatcherExternal(_assetId: number, _removal: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.removeMatcherExternal(_assetId, _removal);

        return await this.send(method, txParams);
    }

    async setMatcher(_assetId: number, _matcher: string[], txParams?: SpecialTx) {
        const method = this.web3Contract.methods.setMatcher(_assetId, _matcher);

        return await this.send(method, txParams);
    }

    async setLastSmartMeterReadFileHash(
        _assetId: number,
        _lastSmartMeterReadFileHash: string,
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.setLastSmartMeterReadFileHash(_assetId, _lastSmartMeterReadFileHash);

        return await this.send(method, txParams);
    }

    async setMarketLookupContract(
        _assetId: number,
        _marketLookupContract: string,
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.setMarketLookupContract(_assetId, _marketLookupContract);

        return await this.send(method, txParams);
    }

    async setSmartMeterRead(
        _assetId: number,
        _lastSmartMeterReadWh: number,
        _lastSmartMeterReadFileHash: string,
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.setSmartMeterRead(_assetId, _lastSmartMeterReadWh, _lastSmartMeterReadFileHash);

        return await this.send(method, txParams);
    }

    async getAssetOwner(_assetId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getAssetOwner(_assetId).call(txParams);
    }

    async owner(txParams?: SpecialTx) {
        return await this.web3Contract.methods.owner().call(txParams);
    }

    async changeOwner(_newOwner: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.changeOwner(_newOwner);

        return await this.send(method, txParams);
    }

    async removeMatcher(_assetId: number, _removal: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.removeMatcher(_assetId, _removal);

        return await this.send(method, txParams);
    }

    async getAssetGeneral(_assetId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getAssetGeneral(_assetId).call(txParams);
    }

    async getAssetListLength(txParams?: SpecialTx) {
        return await this.web3Contract.methods.getAssetListLength().call(txParams);
    }

    async getAssetById(_assetId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getAssetById(_assetId).call(txParams);
    }

    async getActive(_assetId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getActive(_assetId).call(txParams);
    }

    async addFullAsset(_a: any, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.addFullAsset(_a);

        return await this.send(method, txParams);
    }

    async getMarketLookupContract(_assetId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getMarketLookupContract(_assetId).call(txParams);
    }

    async setActive(_assetId: number, _active: boolean, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.setActive(_assetId, _active);

        return await this.send(method, txParams);
    }

    async getSmartMeter(_assetId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getSmartMeter(_assetId).call(txParams);
    }

    async getLastSmartMeterReadFileHash(_assetId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods
            .getLastSmartMeterReadFileHash(_assetId)
            .call(txParams);
    }

    async getMatcher(_assetId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getMatcher(_assetId).call(txParams);
    }
}
