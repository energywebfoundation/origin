import Web3 from 'web3';
import { GeneralFunctions, ISpecialTx, ISearchLog } from './GeneralFunctions';
import AgreementLogicJSON from '../../build/contracts/AgreementLogic.json';

export class AgreementLogic extends GeneralFunctions {
    web3: Web3;

    buildFile = AgreementLogicJSON;

    constructor(web3: Web3, address?: string) {
        super(
            address
                ? new web3.eth.Contract(AgreementLogicJSON.abi, address)
                : new web3.eth.Contract(
                      AgreementLogicJSON.abi,
                      (AgreementLogicJSON as any).networks.length > 0
                          ? AgreementLogicJSON.networks[0]
                          : null
                  )
        );
        this.web3 = web3;
    }

    async getAllLogAgreementFullySignedEvents(eventFilter?: ISearchLog) {
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

        return this.web3Contract.getPastEvents('LogAgreementFullySigned', filterParams);
    }

    async getAllLogAgreementCreatedEvents(eventFilter?: ISearchLog) {
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

        return this.web3Contract.getPastEvents('LogAgreementCreated', filterParams);
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

    async createAgreement(
        _propertiesDocumentHash: string,
        _documentDBURL: string,
        _matcherPropertiesDocumentHash: string,
        _matcherDBURL: string,
        _demandId: number,
        _supplyId: number,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.createAgreement(
            _propertiesDocumentHash,
            _documentDBURL,
            _matcherPropertiesDocumentHash,
            _matcherDBURL,
            _demandId,
            _supplyId
        );

        return this.send(method, txParams);
    }

    async approveAgreementSupply(_agreementId: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.approveAgreementSupply(_agreementId);

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

    async userContractLookup(txParams?: ISpecialTx) {
        return this.web3Contract.methods.userContractLookup().call(txParams);
    }

    async db(txParams?: ISpecialTx) {
        return this.web3Contract.methods.db().call(txParams);
    }

    async getAgreement(_agreementId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getAgreement(_agreementId).call(txParams);
    }

    async setMatcherProperties(
        _agreementId: number,
        _matcherPropertiesDocumentHash: string,
        _matcherDBURL: string,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.setMatcherProperties(
            _agreementId,
            _matcherPropertiesDocumentHash,
            _matcherDBURL
        );

        return this.send(method, txParams);
    }

    async assetContractLookup(txParams?: ISpecialTx) {
        return this.web3Contract.methods.assetContractLookup().call(txParams);
    }

    async owner(txParams?: ISpecialTx) {
        return this.web3Contract.methods.owner().call(txParams);
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
}
