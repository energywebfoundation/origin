import { GeneralFunctions, ISpecialTx, getClientVersion } from '@energyweb/utils-general';
import Web3 from 'web3';
import CertificateSpecificContractJSON from '../../build/contracts/lightweight/CertificateSpecificContract.json';

export class CertificateSpecificContract extends GeneralFunctions {
    web3: Web3;
    buildFile: any = CertificateSpecificContractJSON;

    constructor(web3: Web3, address?: string) {
        super(
            address
                ? new web3.eth.Contract(CertificateSpecificContractJSON.abi, address)
                : new web3.eth.Contract(
                      CertificateSpecificContractJSON.abi,
                      (CertificateSpecificContractJSON as any).networks.length > 0
                          ? CertificateSpecificContractJSON.networks[0]
                          : null
                  )
        );
        this.web3 = web3;
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
