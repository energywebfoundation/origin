import { GeneralFunctions, SpecialTx, getClientVersion } from './GeneralFunctions';
import Web3 = require('web3');
import CertificateSpecificContractJSON from '../../build/contracts/CertificateSpecificContract.json';

export class CertificateSpecificContract extends GeneralFunctions {
    web3: Web3;
    buildFile : any = CertificateSpecificContractJSON;

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

    async getAssetRequestedCertsForSMReadsLength(_assetId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getAssetRequestedCertsForSMReadsLength(_assetId).call(txParams);
    }

    async getCertificationRequests(txParams?: SpecialTx) {
        const length = await this.web3Contract.methods.getCertificationRequestsLength().call(txParams);

        const certificationRequests = [];
        for (let i = 0; i < length; i++) {
            certificationRequests.push(await this.web3Contract.methods.certificationRequests(i).call(txParams));
        }

        return certificationRequests;
    }

    async requestCertificates(_assetId: number, limitingSmartMeterReadIndex: number, txParams?: SpecialTx) {
        let transactionParams;

        const preparedRequestCertificatesMethod = this.web3Contract.methods.requestCertificates(_assetId, limitingSmartMeterReadIndex)

        const txData = await preparedRequestCertificatesMethod.encodeABI();

        let gas;

        if (txParams) {
            if (txParams.privateKey) {
                const privateKey = txParams.privateKey.startsWith('0x')
                    ? txParams.privateKey
                    : '0x' + txParams.privateKey;
                txParams.from = this.web3.eth.accounts.privateKeyToAccount(privateKey).address;
                txParams.nonce = txParams.nonce
                    ? txParams.nonce
                    : await this.web3.eth.getTransactionCount(txParams.from);
            }

            if (!txParams.gas) {
                try {
                    gas = await preparedRequestCertificatesMethod
                        .estimateGas({
                            from: txParams ? txParams.from : (await this.web3.eth.getAccounts())[0]
                        });
                } catch (ex) {
                    if (!(await getClientVersion(this.web3)).includes('Parity')) {
                        throw new Error(ex);
                    }

                    const errorResult = await this.getErrorMessage(this.web3, {
                        from: txParams ? txParams.from : (await this.web3.eth.getAccounts())[0],
                        to: this.web3Contract._address,
                        data: txData,
                        gas: this.web3.utils.toHex(7000000)
                    });
                    throw new Error(errorResult);
                }
                gas = Math.round(gas * 2);

                txParams.gas = gas;
            }

            transactionParams = {
                from: txParams.from ? txParams.from : (await this.web3.eth.getAccounts())[0],
                gas: txParams.gas ? txParams.gas : Math.round(gas * 1.1 + 21000),
                gasPrice: 0,
                nonce: txParams.nonce
                    ? txParams.nonce
                    : await this.web3.eth.getTransactionCount(txParams.from),
                data: txParams.data ? txParams.data : '',
                to: this.web3Contract._address,
                privateKey: txParams.privateKey ? txParams.privateKey : ''
            };
        } else {
            transactionParams = {
                from: (await this.web3.eth.getAccounts())[0],
                gas: Math.round(gas * 1.1 + 21000),
                gasPrice: 0,
                nonce: await this.web3.eth.getTransactionCount(
                    (await this.web3.eth.getAccounts())[0]
                ),
                data: '',
                to: this.web3Contract._address,
                privateKey: ''
            };
        }

        if (transactionParams.privateKey !== '') {
            transactionParams.data = txData;

            return await this.sendRaw(this.web3, transactionParams.privateKey, transactionParams);
        } else {
            return await preparedRequestCertificatesMethod
                .send({ from: transactionParams.from, gas: transactionParams.gas });
        }
    }

    async approveCertificationRequest(_certicationRequestIndex: number, txParams?: SpecialTx) {
        let transactionParams;

        const preparedApproveCertificationRequestMethod = this.web3Contract.methods.approveCertificationRequest(_certicationRequestIndex);

        const txData = await preparedApproveCertificationRequestMethod.encodeABI();

        let gas;

        if (txParams) {
            if (txParams.privateKey) {
                const privateKey = txParams.privateKey.startsWith('0x')
                    ? txParams.privateKey
                    : '0x' + txParams.privateKey;
                txParams.from = this.web3.eth.accounts.privateKeyToAccount(privateKey).address;
                txParams.nonce = txParams.nonce
                    ? txParams.nonce
                    : await this.web3.eth.getTransactionCount(txParams.from);
            }

            if (!txParams.gas) {
                try {
                    gas = await preparedApproveCertificationRequestMethod
                        .estimateGas({
                            from: txParams ? txParams.from : (await this.web3.eth.getAccounts())[0]
                        });
                } catch (ex) {
                    if (!(await getClientVersion(this.web3)).includes('Parity')) {
                        throw new Error(ex);
                    }

                    const errorResult = await this.getErrorMessage(this.web3, {
                        from: txParams ? txParams.from : (await this.web3.eth.getAccounts())[0],
                        to: this.web3Contract._address,
                        data: txData,
                        gas: this.web3.utils.toHex(7000000)
                    });
                    throw new Error(errorResult);
                }
                gas = Math.round(gas * 2);

                txParams.gas = gas;
            }

            transactionParams = {
                from: txParams.from ? txParams.from : (await this.web3.eth.getAccounts())[0],
                gas: txParams.gas ? txParams.gas : Math.round(gas * 1.1 + 21000),
                gasPrice: 0,
                nonce: txParams.nonce
                    ? txParams.nonce
                    : await this.web3.eth.getTransactionCount(txParams.from),
                data: txParams.data ? txParams.data : '',
                to: this.web3Contract._address,
                privateKey: txParams.privateKey ? txParams.privateKey : ''
            };
        } else {
            transactionParams = {
                from: (await this.web3.eth.getAccounts())[0],
                gas: Math.round(gas * 1.1 + 21000),
                gasPrice: 0,
                nonce: await this.web3.eth.getTransactionCount(
                    (await this.web3.eth.getAccounts())[0]
                ),
                data: '',
                to: this.web3Contract._address,
                privateKey: ''
            };
        }

        if (transactionParams.privateKey !== '') {
            transactionParams.data = txData;

            return await this.sendRaw(this.web3, transactionParams.privateKey, transactionParams);
        } else {
            return await preparedApproveCertificationRequestMethod
                .send({ from: transactionParams.from, gas: transactionParams.gas });
        }
    }
}
