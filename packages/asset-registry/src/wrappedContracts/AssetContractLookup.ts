import { GeneralFunctions, ISpecialTx, ISearchLog, getClientVersion } from '@energyweb/utils-general';
import Web3 from 'web3';
import AssetContractLookupJSON from '../../build/contracts/lightweight/AssetContractLookup.json';

export class AssetContractLookup extends GeneralFunctions {
    web3: Web3;
    buildFile = AssetContractLookupJSON;

    constructor(web3: Web3, address?: string) {
        super(
            address
                ? new web3.eth.Contract(AssetContractLookupJSON.abi, address)
                : new web3.eth.Contract(
                      AssetContractLookupJSON.abi,
                      (AssetContractLookupJSON as any).networks.length > 0
                          ? (AssetContractLookupJSON as any).networks[0]
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

    async assetProducingRegistry(txParams?: ISpecialTx) {
        return await this.web3Contract.methods.assetProducingRegistry().call(txParams);
    }

    async init(
        _userRegistry: string,
        _assetProducingRegistry: string,
        _assetConsumingRegistry: string,
        _assetProducingDB: string,
        _assetConsumingDB: string,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.init(
            _userRegistry,
            _assetProducingRegistry,
            _assetConsumingRegistry,
            _assetProducingDB,
            _assetConsumingDB
        );
        const transactionParams = await this.buildTransactionParams(method, txParams);

        return await this.send(method, transactionParams);
    }

    async assetConsumingRegistry(txParams?: ISpecialTx) {
        return await this.web3Contract.methods.assetConsumingRegistry().call(txParams);
    }

    async userRegistry(txParams?: ISpecialTx) {
        return await this.web3Contract.methods.userRegistry().call(txParams);
    }

    async owner(txParams?: ISpecialTx) {
        return await this.web3Contract.methods.owner().call(txParams);
    }

    async changeOwner(_newOwner: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.changeOwner(_newOwner);

        return await this.send(method, txParams);
    }

    async update(
        _assetProducingRegistry: string,
        _assetConsumingRegistry: string,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.update(
            _assetProducingRegistry,
            _assetConsumingRegistry
        );

        return await this.send(method, txParams);
    }
}
