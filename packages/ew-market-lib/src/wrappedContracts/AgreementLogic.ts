import { GeneralFunctions, SpecialTx, SearchLog } from './GeneralFunctions';
import Web3 = require('web3');
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

    async getAllLogAgreementFullySignedEvents(eventFilter?: SearchLog) {
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

        return await this.web3Contract.getPastEvents('LogAgreementFullySigned', filterParams);
    }

    async getAllLogAgreementCreatedEvents(eventFilter?: SearchLog) {
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

        return await this.web3Contract.getPastEvents('LogAgreementCreated', filterParams);
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

    async createAgreement(
        _propertiesDocumentHash: string,
        _documentDBURL: string,
        _matcherPropertiesDocumentHash: string,
        _matcherDBURL: string,
        _demandId: number,
        _supplyId: number,
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods
            .createAgreement(
                _propertiesDocumentHash,
                _documentDBURL,
                _matcherPropertiesDocumentHash,
                _matcherDBURL,
                _demandId,
                _supplyId
            );
        const transactionParams = await this.buildTransactionParams(method, txParams);

        return await this.send(method, transactionParams);
    }

    async approveAgreementSupply(_agreementId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.approveAgreementSupply(_agreementId);
        const transactionParams = await this.buildTransactionParams(method, txParams);

        return await this.send(method, transactionParams);
    }

    async update(_newLogic: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.update(_newLogic);
        const transactionParams = await this.buildTransactionParams(method, txParams);

        return await this.send(method, transactionParams);
    }

    async approveAgreementDemand(_agreementId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.approveAgreementDemand(_agreementId);
        const transactionParams = await this.buildTransactionParams(method, txParams);

        return await this.send(method, transactionParams);
    }

    async getAllAgreementListLength(txParams?: SpecialTx) {
        return await this.web3Contract.methods.getAllAgreementListLength().call(txParams);
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
        const method = this.web3Contract.methods.setMatcherProperties(_agreementId, _matcherPropertiesDocumentHash, _matcherDBURL);
        const transactionParams = await this.buildTransactionParams(method, txParams);

        return await this.send(method, transactionParams);
    }

    async assetContractLookup(txParams?: SpecialTx) {
        return await this.web3Contract.methods.assetContractLookup().call(txParams);
    }

    async owner(txParams?: SpecialTx) {
        return await this.web3Contract.methods.owner().call(txParams);
    }

    async changeOwner(_newOwner: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.changeOwner(_newOwner);
        const transactionParams = await this.buildTransactionParams(method, txParams);

        return await this.send(method, transactionParams);
    }

    async isRole(_role: number, _caller: string, txParams?: SpecialTx) {
        return await this.web3Contract.methods.isRole(_role, _caller).call(txParams);
    }

    async getAgreementStruct(_agreementId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getAgreementStruct(_agreementId).call(txParams);
    }

    async init(_database: string, _admin: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.init(_database, _admin);
        const transactionParams = await this.buildTransactionParams(method, txParams);

        return await this.send(method, transactionParams);
    }
}
