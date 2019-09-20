// eslint-disable-next-line import/no-unresolved
import { Tx } from 'web3/eth/types';
// eslint-disable-next-line import/no-unresolved
import { TransactionReceipt, Logs } from 'web3/types';

import Web3 from 'web3';

export declare interface ISpecialTx extends Tx {
    privateKey: string;
}

export declare interface ISearchLog extends Logs {
    toBlock: number;
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
            (e, r) => {
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
            (e, r) => {
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

    constructor(web3Contract) {
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
                (e, r) => {
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

    async buildTransactionParams(method, params): Promise<ISpecialTx> {
        const txParams = params || {};
        const networkGasPrice = await this.web3.eth.getGasPrice();

        let methodGas;

        if (txParams.privateKey) {
            const privateKey = txParams.privateKey.startsWith('0x')
                ? txParams.privateKey
                : `0x${txParams.privateKey}`;

            txParams.from = this.web3.eth.accounts.privateKeyToAccount(privateKey).address;
        }

        txParams.from = txParams.from || (await this.web3.eth.getAccounts())[0];

        try {
            methodGas = await method.estimateGas({
                from: txParams.from
            });
        } catch (ex) {
            if (!(await getClientVersion(this.web3)).includes('Parity')) {
                throw new Error(ex);
            }

            const errorResult = await this.getErrorMessage(this.web3, {
                from: txParams.from,
                to: this.web3Contract._address,
                data: txParams ? txParams.data : '',
                gas: this.web3.utils.toHex(7000000)
            });
            throw new Error(errorResult);
        }

        return {
            from: txParams.from,
            gas: Math.round((txParams.gas ? txParams.gas : methodGas) * 2),
            gasPrice: txParams.gasPrice ? txParams.gasPrice : networkGasPrice.toString(),
            nonce: txParams.nonce
                ? txParams.nonce
                : await this.web3.eth.getTransactionCount(txParams.from),
            data: txParams.data ? txParams.data : await method.encodeABI(),
            to: this.web3Contract._address,
            privateKey: txParams.privateKey ? txParams.privateKey : ''
        };
    }
}
