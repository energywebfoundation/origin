import { GeneralFunctions, SpecialTx, SearchLog, getClientVersion } from './GeneralFunctions';
import Web3 from 'web3';
import AssetProducingRegistryLogicJSON from '../../build/contracts/lightweight/AssetProducingRegistryLogic.json';
import moment from 'moment';

export class AssetProducingRegistryLogic extends GeneralFunctions {
    web3: Web3;
    buildFile = AssetProducingRegistryLogicJSON;

    constructor(web3: Web3, address?: string) {
        super(
            address
                ? new web3.eth.Contract(AssetProducingRegistryLogicJSON.abi, address)
                : new web3.eth.Contract(
                      AssetProducingRegistryLogicJSON.abi,
                      (AssetProducingRegistryLogicJSON as any).networks.length > 0
                          ? AssetProducingRegistryLogicJSON.networks[0]
                          : null
                  )
        );
        this.web3 = web3;
    }

    async getAllLogNewMeterReadEvents(eventFilter?: SearchLog) {
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

        return await this.web3Contract.getPastEvents('LogNewMeterRead', filterParams);
    }

    async getAllLogAssetCreatedEvents(eventFilter?: SearchLog) {
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

        return await this.web3Contract.getPastEvents('LogAssetCreated', filterParams);
    }

    async getAllLogAssetFullyInitializedEvents(eventFilter?: SearchLog) {
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

        return await this.web3Contract.getPastEvents('LogAssetFullyInitialized', filterParams);
    }

    async getAllLogAssetSetActiveEvents(eventFilter?: SearchLog) {
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

        return await this.web3Contract.getPastEvents('LogAssetSetActive', filterParams);
    }

    async getAllLogAssetSetInactiveEvents(eventFilter?: SearchLog) {
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

        return await this.web3Contract.getPastEvents('LogAssetSetInactive', filterParams);
    }

    async getSmartMeterReadsForAsset(_assetId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getSmartMeterReadsForAsset(_assetId).call(txParams);
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

    async update(_newLogic: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.update(_newLogic);

        return await this.send(method, txParams);
    }

    async getLastMeterReadingAndHash(_assetId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getLastMeterReadingAndHash(_assetId).call(txParams);
    }

    async getAssetBySmartMeter(_smartMeter: string, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getAssetBySmartMeter(_smartMeter).call(txParams);
    }

    async userContractLookup(txParams?: SpecialTx) {
        return await this.web3Contract.methods.userContractLookup().call(txParams);
    }

    async checkAssetExist(_smartMeter: string, txParams?: SpecialTx) {
        return await this.web3Contract.methods.checkAssetExist(_smartMeter).call(txParams);
    }

    async db(txParams?: SpecialTx) {
        return await this.web3Contract.methods.db().call(txParams);
    }

    async createAsset(
        _smartMeter: string,
        _owner: string,
        _active: boolean,
        _propertiesDocumentHash: string,
        _url: string,
        _numOwnerChanges: number,
        txParams?: SpecialTx
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
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.setMarketLookupContract(
            _assetId,
            _marketContractLookup
        );

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

    async checkAssetExistExternal(_smartMeter: string, txParams?: SpecialTx) {
        return await this.web3Contract.methods.checkAssetExistExternal(_smartMeter).call(txParams);
    }

    async setBundleActive(_assetId: number, _active: boolean, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.setBundleActive(_assetId, _active);

        return await this.send(method, txParams);
    }

    async saveSmartMeterRead(
        _assetId: number,
        _newMeterRead: number,
        _lastSmartMeterReadFileHash: string,
        _timestamp: number = moment().unix(),
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.saveSmartMeterRead(
            _assetId,
            _newMeterRead,
            _lastSmartMeterReadFileHash,
            _timestamp
        );

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

    async isRole(_role: number, _caller: string, txParams?: SpecialTx) {
        return await this.web3Contract.methods.isRole(_role, _caller).call(txParams);
    }

    async getMarketLookupContract(_assetId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getMarketLookupContract(_assetId).call(txParams);
    }

    async setActive(_assetId: number, _active: boolean, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.setActive(_assetId, _active);

        return await this.send(method, txParams);
    }

    async init(_dbAddress: string, param1: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.init(_dbAddress, param1);

        return await this.send(method, txParams);
    }
}
