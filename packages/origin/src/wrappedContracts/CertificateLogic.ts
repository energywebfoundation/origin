import { GeneralFunctions, ISpecialTx, ISearchLog, getClientVersion } from '@energyweb/utils-general';
import Web3 from 'web3';
import CertificateLogicJSON from '../../build/contracts/CertificateLogic.json';

export class CertificateLogic extends GeneralFunctions {
    web3: Web3;

    constructor(web3: Web3, address?: string) {
        const buildFile: any = CertificateLogicJSON;
        super(
            address
                ? new web3.eth.Contract(buildFile.abi, address)
                : new web3.eth.Contract(
                    buildFile.abi,
                    buildFile.networks.length > 0
                        ? buildFile.networks[0]
                        : null
                  )
        );
        this.web3 = web3;
    }

    async initialize(assetContractAddress: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.initialize(assetContractAddress);

        return this.send(method, txParams);
    }

    async getAllCertificationApprovedEvents(eventFilter?: ISearchLog) {
        return this.web3Contract.getPastEvents('CertificationRequestApproved', eventFilter);
    }

    async getAllCertificationCreatedEvents(eventFilter?: ISearchLog) {
        return this.web3Contract.getPastEvents('CertificationRequestCreated', eventFilter);
    }

    async getAllLogCreatedCertificateEvents(eventFilter?: ISearchLog) {
        return this.web3Contract.getPastEvents('LogCreatedCertificate', eventFilter);
    }

    async getAllLogCertificateClaimedEvents(eventFilter?: ISearchLog) {
        return this.web3Contract.getPastEvents('LogCertificateClaimed', eventFilter);
    }

    async getAllLogCertificateSplitEvents(eventFilter?: ISearchLog) {
        return this.web3Contract.getPastEvents('LogCertificateSplit', eventFilter);
    }

    async getAllTransferEvents(eventFilter?: ISearchLog) {
        return this.web3Contract.getPastEvents('Transfer', eventFilter);
    }

    async getAllApprovalEvents(eventFilter?: ISearchLog) {
        return this.web3Contract.getPastEvents('Approval', eventFilter);
    }

    async getAllApprovalForAllEvents(eventFilter?: ISearchLog) {
        return this.web3Contract.getPastEvents('ApprovalForAll', eventFilter);
    }

    async getAllLogChangeOwnerEvents(eventFilter?: ISearchLog) {
        return this.web3Contract.getPastEvents('LogChangeOwner', eventFilter);
    }

    async getAllEvents(eventFilter?: ISearchLog) {
        return this.web3Contract.getPastEvents('allEvents', eventFilter);
    }

    async getApproved(_tokenId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getApproved(_tokenId).call(txParams);
    }

    async approve(_approved: string, _certificateId: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.approve(_approved, _certificateId);

        return this.send(method, txParams);
    }

    async transferFrom(_from: string, _to: string, _certificateId: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.transferFrom(_from, _to, _certificateId);

        return this.send(method, txParams);
    }

    async splitCertificate(_certificateId: number, _energy: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.splitCertificate(_certificateId, _energy);

        return this.send(method, txParams);
    }

    async splitAndPublishForSale(
        _certificateId: number,
        _energy: number,
        _price: number,
        _tokenAddress: string,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.splitAndPublishForSale(
            _certificateId,
            _energy,
            _price,
            _tokenAddress
        );

        return this.send(method, txParams);
    }

    async safeTransferFrom(_from: string, _to: string, _certificateId: string, _data?: any, txParams?: ISpecialTx) {
        if (_data) {
            const method = this.web3Contract.methods.safeTransferFrom(_from, _to, _certificateId, _data);

            return this.send(method, txParams);
        } else {
            const method = this.web3Contract.methods.safeTransferFrom(_from, _to, _certificateId);

            return this.send(method, txParams);
        }
    }

    async getCertificate(_certificateId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getCertificate(_certificateId).call(txParams);
    }

    async ownerOf(_certificateId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.ownerOf(_certificateId).call(txParams);
    }

    async balanceOf(_owner: string, txParams?: ISpecialTx) {
        return this.web3Contract.methods.balanceOf(_owner).call(txParams);
    }

    async getCertificateOwner(_certificateId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getCertificateOwner(_certificateId).call(txParams);
    }

    async splitAndBuyCertificate(_certificateId: number, _energy: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.splitAndBuyCertificate(_certificateId, _energy);

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

    async setApprovalForAll(_escrow: string, _approved: boolean, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.setApprovalForAll(_escrow, _approved);

        return this.send(method, txParams);
    }

    async getCertificateListLength(txParams?: ISpecialTx) {
        return this.web3Contract.methods.totalSupply().call(txParams);
    }

    async isRole(_role: number, _caller: string, txParams?: ISpecialTx) {
        return this.web3Contract.methods.isRole(_role, _caller).call(txParams);
    }

    async publishForSale(
        _certificateId: number,
        _price: number,
        _tokenAddress: string,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.publishForSale(
            _certificateId,
            _price,
            _tokenAddress
        );

        return this.send(method, txParams);
    }

    async unpublishForSale(_certificateId: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.unpublishForSale(_certificateId);

        return this.send(method, txParams);
    }

    async isClaimed(_certificateId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.isClaimed(_certificateId).call(txParams);
    }

    async claimCertificate(_certificateId: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.claimCertificate(_certificateId);

        return this.send(method, txParams);
    }

    async claimCertificateBulk(_idArray: number[], txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.claimCertificateBulk(_idArray);

        return this.send(method, txParams);
    }

    async getOnChainDirectPurchasePrice(_certificateId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods
            .getOnChainDirectPurchasePrice(_certificateId)
            .call(txParams);
    }

    async isApprovedForAll(_owner: string, _operator: string, txParams?: ISpecialTx) {
        return this.web3Contract.methods.isApprovedForAll(_owner, _operator).call(txParams);
    }

    async getCertificationRequests(txParams?: ISpecialTx) {
        return this.web3Contract.methods.getCertificationRequests().call(txParams);
    }

    async getCertificationRequestsLength(txParams?: ISpecialTx) {
        return this.web3Contract.methods.getCertificationRequestsLength().call(txParams);
    }

    async requestCertificates(
        _assetId: number,
        limitingSmartMeterReadIndex: number,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.requestCertificates(
            _assetId,
            limitingSmartMeterReadIndex
        );

        return this.send(method, txParams);
    }

    async approveCertificationRequest(_certicationRequestIndex: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.approveCertificationRequest(
            _certicationRequestIndex
        );

        return this.send(method, txParams);
    }

    async getAssetRequestedCertsForSMReadsLength(_assetId: number, txParams?: ISpecialTx) {
        return await this.web3Contract.methods
            .getAssetRequestedCertsForSMReadsLength(_assetId)
            .call(txParams);
    }

    async getTradableToken(_certificateId: number, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getTradableToken(_certificateId).call(txParams);
    }

    async assetLogicAddress(txParams?: ISpecialTx) {
        return this.web3Contract.methods.assetLogicAddress().call(txParams);
    }
}
