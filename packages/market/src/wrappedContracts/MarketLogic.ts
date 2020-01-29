import Web3 from 'web3';
import { GeneralFunctions, ISpecialTx } from '@energyweb/utils-general';
import { PastEventOptions } from 'web3-eth-contract';
import { EventLog } from 'web3-core';
import MarketLogicJSON from '../../build/contracts/lightweight/MarketLogic.json';

const SUPPORTED_EVENTS = ['allEvents', 'LogPublishForSale', 'LogUnpublishForSale'];

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

    async getEvents(event: string, eventFilter?: PastEventOptions): Promise<EventLog[]> {
        if (!SUPPORTED_EVENTS.includes(event)) {
            throw new Error('This event does not exist.');
        }
        return this.web3Contract.getPastEvents(event, this.createFilter(eventFilter));
    }

    async getAllEvents(eventFilter?: PastEventOptions) {
        return this.getEvents('allEvents', this.createFilter(eventFilter));
    }

    async initialize(certificateContractAddress: string, txParams: ISpecialTx) {
        const method = this.web3Contract.methods.initialize(certificateContractAddress);

        return this.send(method, txParams);
    }

    async isRole(_role: number, _caller: string, txParams?: ISpecialTx) {
        return this.web3Contract.methods.isRole(_role, _caller).call(txParams);
    }

    async getPurchasableCertificate(_certificateId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getPurchasableCertificate(_certificateId).call(txParams);
    }

    async splitAndPublishForSale(
        _certificateId: number,
        _energy: number,
        _price: number,
        _tokenAddress: string,
        _propertiesDocumentHash: string,
        _documentDBURL: string,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.splitAndPublishForSale(
            _certificateId,
            _energy,
            _price,
            _tokenAddress,
            _propertiesDocumentHash,
            _documentDBURL
        );

        return this.send(method, txParams);
    }

    async splitAndBuyCertificate(_certificateId: number, _energy: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.splitAndBuyCertificate(_certificateId, _energy);

        return this.send(method, txParams);
    }

    async splitAndBuyCertificateFor(
        _certificateId: number,
        _energy: number,
        _newOwner: string,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.splitAndBuyCertificateFor(
            _certificateId,
            _energy,
            _newOwner
        );

        return this.send(method, txParams);
    }

    async buyCertificate(_certificateId: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.buyCertificate(_certificateId);

        return this.send(method, txParams);
    }

    async buyCertificateBulk(_idArray: number[], txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.buyCertificateBulk(_idArray);

        return this.send(method, txParams);
    }

    async publishForSale(
        _certificateId: number,
        _price: number,
        _tokenAddress: string,
        _propertiesDocumentHash: string,
        _documentDBURL: string,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.publishForSale(
            _certificateId,
            _price,
            _tokenAddress,
            _propertiesDocumentHash,
            _documentDBURL
        );

        return this.send(method, txParams);
    }

    async unpublishForSale(_certificateId: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.unpublishForSale(_certificateId);

        return this.send(method, txParams);
    }

    async getOnChainDirectPurchasePrice(_certificateId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods
            .getOnChainDirectPurchasePrice(_certificateId)
            .call(txParams);
    }

    async getTradableToken(_certificateId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getTradableToken(_certificateId).call(txParams);
    }

    async certificateLogicAddress(txParams?: ISpecialTx) {
        return this.web3Contract.methods.certificateLogicAddress().call(txParams);
    }
}
