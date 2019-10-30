import { GeneralFunctions, ISpecialTx, ISearchLog } from '@energyweb/utils-general';
import Web3 from 'web3';
import CertificateSpecificContractJSON from '../../build/contracts/lightweight/CertificateSpecificContract.json';

export class CertificateSpecificContract extends GeneralFunctions {
    web3: Web3;

    constructor(web3: Web3, address?: string) {
        const buildFile: any = CertificateSpecificContractJSON;
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

    async getAllCertificationApprovedEvents(eventFilter?: ISearchLog) {
        return this.web3Contract.getPastEvents('CertificationRequestApproved', eventFilter);
    }

    async getAllCertificationCreatedEvents(eventFilter?: ISearchLog) {
        return this.web3Contract.getPastEvents('CertificationRequestCreated', eventFilter);
    }

    async getAssetRequestedCertsForSMReadsLength(_assetId: number, txParams?: ISpecialTx) {
        return await this.web3Contract.methods
            .getAssetRequestedCertsForSMReadsLength(_assetId)
            .call(txParams);
    }

    async getCertificationRequests(txParams?: ISpecialTx) {
        const length = await this.web3Contract.methods
            .getCertificationRequestsLength()
            .call(txParams);

        const certificationRequests = [];
        for (let i = 0; i < length; i++) {
            certificationRequests.push(
                await this.web3Contract.methods.certificationRequests(i).call(txParams)
            );
        }

        return certificationRequests;
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

        return await this.send(method, txParams);
    }

    async approveCertificationRequest(_certicationRequestIndex: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.approveCertificationRequest(
            _certicationRequestIndex
        );

        return await this.send(method, txParams);
    }
}
