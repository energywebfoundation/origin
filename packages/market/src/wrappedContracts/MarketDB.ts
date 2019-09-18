import Web3 from 'web3';
import { GeneralFunctions, SpecialTx, SearchLog } from './GeneralFunctions';
import MarketDBJSON from '../../build/contracts/lightweight/MarketDB.json';

export class MarketDB extends GeneralFunctions {
    web3: Web3;

    buildFile = MarketDBJSON;

    constructor(web3: Web3, address?: string) {
        super(
            address
                ? new web3.eth.Contract(MarketDBJSON.abi, address)
                : new web3.eth.Contract(
                      MarketDBJSON.abi,
                      MarketDBJSON.networks[0]
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

    async getAllAgreementListLengthDB(txParams?: SpecialTx) {
        return await this.web3Contract.methods.getAllAgreementListLengthDB().call(txParams);
    }

    async getDemand(_demandId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getDemand(_demandId).call(txParams);
    }

    async setMatcherPropertiesAndURL(
        _agreementId: number,
        _matcherPropertiesDocumentHash: string,
        _matcherDBURL: string,
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.setMatcherPropertiesAndURL(
            _agreementId,
            _matcherPropertiesDocumentHash,
            _matcherDBURL
        );

        return await this.send(method, txParams);
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

    async setAgreementMatcher(_agreementId: number, _matchers: string[], txParams?: SpecialTx) {
        const method = this.web3Contract.methods.setAgreementMatcher(_agreementId, _matchers);

        return await this.send(method, txParams);
    }

    async getAgreementDB(_agreementId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getAgreementDB(_agreementId).call(txParams);
    }

    async getAllSupplyListLength(txParams?: SpecialTx) {
        return await this.web3Contract.methods.getAllSupplyListLength().call(txParams);
    }

    async createDemand(
        _propertiesDocumentHash: string,
        _documentDBURL: string,
        _demandOwner: string,
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.createDemand(
            _propertiesDocumentHash,
            _documentDBURL,
            _demandOwner
        );

        return await this.send(method, txParams);
    }

    async approveAgreementSupplyDB(_agreementId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.approveAgreementSupplyDB(_agreementId);

        return await this.send(method, txParams);
    }

    async owner(txParams?: SpecialTx) {
        return await this.web3Contract.methods.owner().call(txParams);
    }

    async changeOwner(_newOwner: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.changeOwner(_newOwner);

        return await this.send(method, txParams);
    }

    async approveAgreementDemandDB(_agreementId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.approveAgreementDemandDB(_agreementId);

        return await this.send(method, txParams);
    }

    async createAgreementDB(
        _propertiesDocumentHash: string,
        _documentDBURL: string,
        _matcherPropertiesDocumentHash: string,
        _matcherDBURL: string,
        _demandId: number,
        _supplyId: number,
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.createAgreementDB(
            _propertiesDocumentHash,
            _documentDBURL,
            _matcherPropertiesDocumentHash,
            _matcherDBURL,
            _demandId,
            _supplyId
        );

        return await this.send(method, txParams);
    }

    async getSupply(_supplyId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getSupply(_supplyId).call(txParams);
    }

    async getAllDemandListLength(txParams?: SpecialTx) {
        return await this.web3Contract.methods.getAllDemandListLength().call(txParams);
    }
}
