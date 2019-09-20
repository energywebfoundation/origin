import Web3 from 'web3';
import { GeneralFunctions, ISpecialTx, ISearchLog } from './GeneralFunctions';
import MarketDBJSON from '../../build/contracts/lightweight/MarketDB.json';

export class MarketDB extends GeneralFunctions {
    web3: Web3;

    buildFile = MarketDBJSON;

    constructor(web3: Web3, address?: string) {
        super(
            address
                ? new web3.eth.Contract(MarketDBJSON.abi, address)
                : new web3.eth.Contract(MarketDBJSON.abi, MarketDBJSON.networks[0])
        );
        this.web3 = web3;
    }

    async getAllLogChangeOwnerEvents(eventFilter?: ISearchLog) {
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

        return this.web3Contract.getPastEvents('LogChangeOwner', filterParams);
    }

    async getAllEvents(eventFilter?: ISearchLog) {
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

        return this.web3Contract.getPastEvents('allEvents', filterParams);
    }

    async getAllAgreementListLengthDB(txParams?: ISpecialTx) {
        return this.web3Contract.methods.getAllAgreementListLengthDB().call(txParams);
    }

    async getDemand(_demandId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getDemand(_demandId).call(txParams);
    }

    async createSupply(
        _propertiesDocumentHash: string,
        _documentDBURL: string,
        _assetId: number,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.createSupply(
            _propertiesDocumentHash,
            _documentDBURL,
            _assetId
        );

        return this.send(method, txParams);
    }

    async getAgreementDB(_agreementId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getAgreementDB(_agreementId).call(txParams);
    }

    async getAllSupplyListLength(txParams?: ISpecialTx) {
        return this.web3Contract.methods.getAllSupplyListLength().call(txParams);
    }

    async createDemand(
        _propertiesDocumentHash: string,
        _documentDBURL: string,
        _demandOwner: string,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.createDemand(
            _propertiesDocumentHash,
            _documentDBURL,
            _demandOwner
        );

        return this.send(method, txParams);
    }

    async approveAgreementSupplyDB(_agreementId: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.approveAgreementSupplyDB(_agreementId);

        return this.send(method, txParams);
    }

    async owner(txParams?: ISpecialTx) {
        return this.web3Contract.methods.owner().call(txParams);
    }

    async changeOwner(_newOwner: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.changeOwner(_newOwner);

        return this.send(method, txParams);
    }

    async approveAgreementDemandDB(_agreementId: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.approveAgreementDemandDB(_agreementId);

        return this.send(method, txParams);
    }

    async createAgreementDB(
        _propertiesDocumentHash: string,
        _documentDBURL: string,
        _demandId: number,
        _supplyId: number,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.createAgreementDB(
            _propertiesDocumentHash,
            _documentDBURL,
            _demandId,
            _supplyId
        );

        return this.send(method, txParams);
    }

    async getSupply(_supplyId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getSupply(_supplyId).call(txParams);
    }

    async getAllDemandListLength(txParams?: ISpecialTx) {
        return this.web3Contract.methods.getAllDemandListLength().call(txParams);
    }
}
