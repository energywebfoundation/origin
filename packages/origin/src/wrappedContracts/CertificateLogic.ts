import { GeneralFunctions, ISpecialTx } from '@energyweb/utils-general';
import { PastEventOptions } from 'web3-eth-contract';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import CertificateLogicJSON from '../../build/contracts/CertificateLogic.json';

export class CertificateLogic extends GeneralFunctions {
    web3: Web3;

    constructor(web3: Web3, address?: string) {
        const buildFile = CertificateLogicJSON;
        const buildFileAbi = buildFile.abi as AbiItem[];

        super(
            address
                ? new web3.eth.Contract(buildFileAbi, address)
                : new web3.eth.Contract(
                      buildFileAbi,
                      (buildFile.networks as any).length > 0 ? (buildFile.networks as any)[0] : null
                  )
        );
        this.web3 = web3;
    }

    async initialize(deviceContractAddress: string, txParams: ISpecialTx) {
        const method = this.web3Contract.methods.initialize(deviceContractAddress);

        return this.send(method, txParams);
    }

    async getAllCertificationApprovedEvents(eventFilter?: PastEventOptions) {
        return this.web3Contract.getPastEvents(
            'CertificationRequestApproved',
            this.createFilter(eventFilter)
        );
    }

    async getAllCertificationCreatedEvents(eventFilter?: PastEventOptions) {
        return this.web3Contract.getPastEvents(
            'CertificationRequestCreated',
            this.createFilter(eventFilter)
        );
    }

    async getAllLogCreatedCertificateEvents(eventFilter?: PastEventOptions) {
        return this.web3Contract.getPastEvents(
            'LogCreatedCertificate',
            this.createFilter(eventFilter)
        );
    }

    async getAllLogCertificateClaimedEvents(eventFilter?: PastEventOptions) {
        return this.web3Contract.getPastEvents(
            'LogCertificateClaimed',
            this.createFilter(eventFilter)
        );
    }

    async getAllLogCertificateSplitEvents(eventFilter?: PastEventOptions) {
        return this.web3Contract.getPastEvents(
            'LogCertificateSplit',
            this.createFilter(eventFilter)
        );
    }

    async getAllTransferEvents(eventFilter?: PastEventOptions) {
        return this.web3Contract.getPastEvents('Transfer', this.createFilter(eventFilter));
    }

    async getAllApprovalEvents(eventFilter?: PastEventOptions) {
        return this.web3Contract.getPastEvents('Approval', this.createFilter(eventFilter));
    }

    async getAllApprovalForAllEvents(eventFilter?: PastEventOptions) {
        return this.web3Contract.getPastEvents('ApprovalForAll', this.createFilter(eventFilter));
    }

    async getAllLogChangeOwnerEvents(eventFilter?: PastEventOptions) {
        return this.web3Contract.getPastEvents('LogChangeOwner', this.createFilter(eventFilter));
    }

    async getAllEvents(eventFilter?: PastEventOptions) {
        return this.web3Contract.getPastEvents('allEvents', this.createFilter(eventFilter));
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

    async safeTransferFrom(
        _from: string,
        _to: string,
        _certificateId: string,
        _data?: any,
        txParams?: ISpecialTx
    ) {
        if (_data) {
            const method = this.web3Contract.methods.safeTransferFrom(
                _from,
                _to,
                _certificateId,
                _data
            );

            return this.send(method, txParams);
        }
        const method = this.web3Contract.methods.safeTransferFrom(_from, _to, _certificateId);

        return this.send(method, txParams);
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

    async isApprovedForAll(_owner: string, _operator: string, txParams?: ISpecialTx) {
        return this.web3Contract.methods.isApprovedForAll(_owner, _operator).call(txParams);
    }

    async createArbitraryCertfificate(
        deviceId: number,
        energy: number,
        certificationRequestId?: string,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.createArbitraryCertfificate(
            deviceId,
            energy,
            certificationRequestId || ''
        );

        return this.send(method, txParams);
    }

    async deviceLogicAddress(txParams?: ISpecialTx) {
        return this.web3Contract.methods.deviceLogicAddress().call(txParams);
    }
}
