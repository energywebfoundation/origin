import Web3 from 'web3';
import MarketLogicJSON from '../../build/contracts/lightweight/MarketLogic.json';
import { DemandStatus } from '../blockchain-facade/Demand';
import { GeneralFunctions, ISearchLog, ISpecialTx } from './GeneralFunctions';

const SUPPORTED_EVENTS = [
    'allEvents',
    'createdNewDemand',
    'createdNewSupply',
    'deletedDemand',
    'LogAgreementFullySigned',
    'LogAgreementCreated',
    'LogChangeOwner',
    'DemandStatusChanged',
    'DemandUpdated',
    'DemandPartiallyFilled'
];

export class MarketLogic extends GeneralFunctions {
    web3: Web3;

    constructor(web3: Web3, address?: string) {
        const buildFile: any = MarketLogicJSON;
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

    async getEvents(event, eventFilter?: ISearchLog) {
        if (!SUPPORTED_EVENTS.includes(event)) {
            throw new Error('This event does not exist.');
        }

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

        return this.web3Contract.getPastEvents(event, filterParams);
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

    async createAgreement(
        _propertiesDocumentHash: string,
        _documentDBURL: string,
        _demandId: number,
        _supplyId: number,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.createAgreement(
            _propertiesDocumentHash,
            _documentDBURL,
            _demandId,
            _supplyId
        );

        return this.send(method, txParams);
    }

    async approveAgreementSupply(_agreementId: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.approveAgreementSupply(_agreementId);

        return this.send(method, txParams);
    }

    async getDemand(_demandId: string, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getDemand(_demandId).call(txParams);
    }

    async deleteDemand(_demandId: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.deleteDemand(_demandId);

        return this.send(method, txParams);
    }

    async updateDemand(
        _demandId: string,
        _propertiesDocumentHash: string,
        _documentDBURL: string,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.updateDemand(
            _demandId,
            _propertiesDocumentHash,
            _documentDBURL
        );

        return this.send(method, txParams);
    }

    async fillDemand(_demandId: string, _entityId: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.fillDemand(_demandId, _entityId);

        return this.send(method, txParams);
    }

    async update(_newLogic: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.update(_newLogic);

        return this.send(method, txParams);
    }

    async approveAgreementDemand(_agreementId: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.approveAgreementDemand(_agreementId);

        return this.send(method, txParams);
    }

    async getAllAgreementListLength(txParams?: ISpecialTx) {
        return this.web3Contract.methods.getAllAgreementListLength().call(txParams);
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

    async userContractLookup(txParams?: ISpecialTx) {
        return this.web3Contract.methods.userContractLookup().call(txParams);
    }

    async db(txParams?: ISpecialTx) {
        return this.web3Contract.methods.db().call(txParams);
    }

    async getAgreement(_agreementId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getAgreement(_agreementId).call(txParams);
    }

    async getAllSupplyListLength(txParams?: ISpecialTx) {
        return this.web3Contract.methods.getAllSupplyListLength().call(txParams);
    }

    async assetContractLookup(txParams?: ISpecialTx) {
        return this.web3Contract.methods.assetContractLookup().call(txParams);
    }

    async owner(txParams?: ISpecialTx) {
        return this.web3Contract.methods.owner().call(txParams);
    }

    async createDemand(
        _propertiesDocumentHash: string,
        _documentDBURL: string,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.createDemand(
            _propertiesDocumentHash,
            _documentDBURL
        );

        return this.send(method, txParams);
    }

    async changeOwner(_newOwner: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.changeOwner(_newOwner);

        return this.send(method, txParams);
    }

    async isRole(_role: number, _caller: string, txParams?: ISpecialTx) {
        return this.web3Contract.methods.isRole(_role, _caller).call(txParams);
    }

    async getAgreementStruct(_agreementId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getAgreementStruct(_agreementId).call(txParams);
    }

    async init(_database: string, _admin: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.init(_database, _admin);

        return this.send(method, txParams);
    }

    async getSupply(_supplyId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getSupply(_supplyId).call(txParams);
    }

    async getAllDemandListLength(txParams?: ISpecialTx) {
        return this.web3Contract.methods.getAllDemandListLength().call(txParams);
    }

    async changeDemandStatus(_demandId: string, _status: DemandStatus, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.changeDemandStatus(_demandId, _status);

        return this.send(method, txParams);
    }
}
