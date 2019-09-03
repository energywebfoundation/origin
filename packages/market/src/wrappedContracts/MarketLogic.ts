import { GeneralFunctions, SpecialTx, SearchLog, getClientVersion } from './GeneralFunctions';
import Web3 = require('web3');
import MarketLogicJSON from '../../build/contracts/MarketLogic.json';
import { DemandStatus } from '../blockchain-facade/Demand';

const SUPPORTED_EVENTS = [
    'allEvents',
    'createdNewDemand',
    'createdNewSupply',
    'deletedDemand',
    'LogAgreementFullySigned',
    'LogAgreementCreated',
    'LogChangeOwner',
    'DemandStatusChanged'
];

export class MarketLogic extends GeneralFunctions {
    web3: Web3;
    buildFile = MarketLogicJSON;

    constructor(web3: Web3, address?: string) {
        super(
            address
                ? new web3.eth.Contract(MarketLogicJSON.abi, address)
                : new web3.eth.Contract(
                      MarketLogicJSON.abi,
                      (MarketLogicJSON as any).networks.length > 0
                          ? MarketLogicJSON.networks[0]
                          : null
                  )
        );
        this.web3 = web3;
    }

    async getEvents(event, eventFilter?: SearchLog) {
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

        return await this.web3Contract.getPastEvents(event, filterParams);
    }

    async createAgreement(
        _propertiesDocumentHash: string,
        _documentDBURL: string,
        _matcherPropertiesDocumentHash: string,
        _matcherDBURL: string,
        _demandId: number,
        _supplyId: number,
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.createAgreement(
            _propertiesDocumentHash,
            _documentDBURL,
            _matcherPropertiesDocumentHash,
            _matcherDBURL,
            _demandId,
            _supplyId
        );

        return await this.send(method, txParams);
    }

    async approveAgreementSupply(_agreementId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.approveAgreementSupply(_agreementId);

        return await this.send(method, txParams);
    }

    async getDemand(_demandId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getDemand(_demandId).call(txParams);
    }

    async deleteDemand(_demandId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.deleteDemand(_demandId);

        return await this.send(method, txParams);
    }

    async update(_newLogic: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.update(_newLogic);

        return await this.send(method, txParams);
    }

    async approveAgreementDemand(_agreementId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.approveAgreementDemand(_agreementId);

        return await this.send(method, txParams);
    }

    async getAllAgreementListLength(txParams?: SpecialTx) {
        return await this.web3Contract.methods.getAllAgreementListLength().call(txParams);
    }

    async createSupply(
        _propertiesDocumentHash: string,
        _documentDBURL: string,
        _assetId: number,
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.createSupply(
            _propertiesDocumentHash,
            _documentDBURL,
            _assetId
        );

        return await this.send(method, txParams);
    }

    async userContractLookup(txParams?: SpecialTx) {
        return await this.web3Contract.methods.userContractLookup().call(txParams);
    }

    async db(txParams?: SpecialTx) {
        return await this.web3Contract.methods.db().call(txParams);
    }

    async getAgreement(_agreementId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getAgreement(_agreementId).call(txParams);
    }

    async setMatcherProperties(
        _agreementId: number,
        _matcherPropertiesDocumentHash: string,
        _matcherDBURL: string,
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.setMatcherProperties(
            _agreementId,
            _matcherPropertiesDocumentHash,
            _matcherDBURL
        );

        return await this.send(method, txParams);
    }

    async getAllSupplyListLength(txParams?: SpecialTx) {
        return await this.web3Contract.methods.getAllSupplyListLength().call(txParams);
    }

    async assetContractLookup(txParams?: SpecialTx) {
        return await this.web3Contract.methods.assetContractLookup().call(txParams);
    }

    async owner(txParams?: SpecialTx) {
        return await this.web3Contract.methods.owner().call(txParams);
    }

    async createDemand(
        _propertiesDocumentHash: string,
        _documentDBURL: string,
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.createDemand(
            _propertiesDocumentHash,
            _documentDBURL
        );

        return await this.send(method, txParams);
    }

    async changeOwner(_newOwner: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.changeOwner(_newOwner);

        return await this.send(method, txParams);
    }

    async isRole(_role: number, _caller: string, txParams?: SpecialTx) {
        return await this.web3Contract.methods.isRole(_role, _caller).call(txParams);
    }

    async getAgreementStruct(_agreementId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getAgreementStruct(_agreementId).call(txParams);
    }

    async init(_database: string, _admin: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.init(_database, _admin);

        return await this.send(method, txParams);
    }

    async getSupply(_supplyId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getSupply(_supplyId).call(txParams);
    }

    async getAllDemandListLength(txParams?: SpecialTx) {
        return await this.web3Contract.methods.getAllDemandListLength().call(txParams);
    }

    async changeDemandStatus(_demandId: number, _status: DemandStatus, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.changeDemandStatus(_demandId, _status);

        return this.send(method, txParams);
    }
}
