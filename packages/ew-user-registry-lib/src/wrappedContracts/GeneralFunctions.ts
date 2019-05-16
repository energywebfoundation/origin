import Web3 = require('web3');
import { Tx, BlockType } from 'web3/eth/types';
import { TransactionReceipt, Logs } from 'web3/types';
import { JsonRPCResponse } from 'web3/providers';

export declare interface SpecialTx extends Tx {
    privateKey: string;
}

export declare interface SearchLog extends Logs {
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

    constructor(web3Contract) {
        this.web3Contract = web3Contract;
    }

    async sendRaw(web3: Web3, privateKey: string, txParams: Tx): Promise<TransactionReceipt> {
        const txData = {
            nonce: txParams.nonce,
            gasLimit: txParams.gas,
            gasPrice: 0,
            data: txParams.data,
            from: txParams.from,
            to: txParams.to
        };

        const txObject = await web3.eth.accounts.signTransaction(txData, privateKey);

        return await web3.eth.sendSignedTransaction((txObject as any).rawTransaction);
    }

    getWeb3Contract() {
        return this.web3Contract;
    }

    async getErrorMessage(web3: Web3, txObj: Tx): Promise<string> {
        return await new Promise<any>((resolve, reject) => {
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

                        const shorterAsciiCode = '0x' + outputResult.substr(10);

                        if (r.result.output === '0x') {
                            resolve('Bad instruction / revert without reason string');
                        }

                        resolve(web3.utils.toAscii(shorterAsciiCode));
                    }
                }
            );
        });
    }
}
