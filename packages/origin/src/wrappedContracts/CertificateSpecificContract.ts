import { GeneralFunctions, SpecialTx, getClientVersion } from './GeneralFunctions';
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
                    buildFile.networks.length > 0
                        ? buildFile.networks[0]
                        : null
                )
        );
        this.web3 = web3;
    }

    async getAssetRequestedCertsForSMReadsLength(_assetId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods
            .getAssetRequestedCertsForSMReadsLength(_assetId)
            .call(txParams);
    }

    async getCertificationRequests(txParams?: SpecialTx) {
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
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.requestCertificates(
            _assetId,
            limitingSmartMeterReadIndex
        );

        return await this.send(method, txParams);
    }

    async approveCertificationRequest(_certicationRequestIndex: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.approveCertificationRequest(
            _certicationRequestIndex
        );

        return await this.send(method, txParams);
    }
}
