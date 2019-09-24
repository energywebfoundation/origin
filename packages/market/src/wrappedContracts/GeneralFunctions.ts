import Web3 from 'web3';
import { Tx } from 'web3/eth/types'; // eslint-disable-line import/no-unresolved
import { TransactionReceipt, Logs } from 'web3/types'; // eslint-disable-line import/no-unresolved

export declare interface ISpecialTx extends Tx {
    privateKey: string;
}

export declare interface ISearchLog extends Logs {
    toBlock?: number;
    filter?: any;
}

export async function getClientVersion(web3: Web3): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        (web3.currentProvider as any).send(
            {
                jsonrpc: '2.0',
                method: 'web3_clientVersion',
                params: [],
                id: 1
            },
            (e: any, r: any) => {
                if (e) {
                    reject(e);
                } else {
                    resolve(r.result);
                }
            }
        );
    });
}

export async function replayTransaction(web3: Web3, txHash: string) {
    return new Promise((resolve, reject) => {
        (web3.currentProvider as any).send(
            {
                jsonrpc: '2.0',
                method: 'trace_replayTransaction',
                params: [txHash, ['trace', 'vmTrace', 'stateDiff']],
                id: 1
            },
            (e: any, r: any) => {
                if (e) {
                    reject(e);
                } else {
                    resolve(r.result);
                }
            }
        );
    });
}

export class GeneralFunctions {
    web3Contract: any;

    web3: Web3;

    constructor(web3Contract: any) {
        this.web3Contract = web3Contract;
    }

    async sendRaw(web3: Web3, privateKey: string, txParams: Tx): Promise<TransactionReceipt> {
        const txData = {
            nonce: txParams.nonce,
            gasLimit: txParams.gas,
            gasPrice: txParams.gasPrice,
            data: txParams.data,
            from: txParams.from,
            to: txParams.to
        };

        const txObject = await web3.eth.accounts.signTransaction(txData, privateKey);

        return web3.eth.sendSignedTransaction((txObject as any).rawTransaction);
    }

    async send(method: any, txParams: ISpecialTx): Promise<TransactionReceipt> {
        const transactionParams: ISpecialTx = await this.buildTransactionParams(method, txParams);

        if (transactionParams.privateKey === '') {
            return this.web3.eth.sendTransaction(transactionParams);
        }

        return this.sendRaw(this.web3, transactionParams.privateKey, transactionParams);
    }

    getWeb3Contract() {
        return this.web3Contract;
    }

    async getErrorMessage(web3: Web3, txObj: Tx): Promise<string> {
        return new Promise<any>((resolve, reject) => {
            (web3.currentProvider as any).send(
                {
                    jsonrpc: '2.0',
                    method: 'trace_call',
                    params: [txObj, ['trace']],
                    id: 1
                },
                (e: any, r: any) => {
                    if (e) {
                        reject(e);
                    } else {
                        const outputResult = r.result.output;

                        const shorterAsciiCode = `0x${outputResult.substr(10)}`;

                        if (r.result.output === '0x') {
                            resolve('Bad instruction / revert without reason string');
                        }

                        resolve(web3.utils.toAscii(shorterAsciiCode));
                    }
                }
            );
        });
    }

    async buildTransactionParams(method: any, params: any): Promise<ISpecialTx> {
        const parameters = params || {};
        const networkGasPrice = await this.web3.eth.getGasPrice();

        let methodGas;

        if (parameters.privateKey) {
            const privateKey = parameters.privateKey.startsWith('0x')
                ? parameters.privateKey
                : `0x${parameters.privateKey}`;

            parameters.from = this.web3.eth.accounts.privateKeyToAccount(privateKey).address;
        }

        parameters.from = parameters.from || (await this.web3.eth.getAccounts())[0];

        try {
            methodGas = await method.estimateGas({
                from: parameters.from
            });
        } catch (ex) {
            if (!(await getClientVersion(this.web3)).includes('Parity')) {
                throw new Error(ex);
            }

            const errorResult = await this.getErrorMessage(this.web3, {
                from: parameters.from,
                to: this.web3Contract._address,
                data: parameters ? parameters.data : '',
                gas: this.web3.utils.toHex(7000000)
            });
            throw new Error(errorResult);
        }

        return {
            from: parameters.from,
            gas: Math.round((parameters.gas ? parameters.gas : methodGas) * 2),
            gasPrice: parameters.gasPrice ? parameters.gasPrice : networkGasPrice.toString(),
            nonce: parameters.nonce
                ? parameters.nonce
                : await this.web3.eth.getTransactionCount(parameters.from),
            data: parameters.data ? parameters.data : await method.encodeABI(),
            to: this.web3Contract._address,
            privateKey: parameters.privateKey ? parameters.privateKey : ''
        };
    }
}
