import Web3 = require('web3');
import { Tx } from 'web3/eth/types';
import { TransactionReceipt, Logs } from 'web3/types';

export declare interface SpecialTx extends Tx {
    privateKey: string;
}

export declare interface SearchLog extends Logs {
    toBlock: number;
}

export declare interface ITxParams {
    from: string;
    privateKey?: string;
    nonce?: number;
    gas?: number;
    gasPrice?: string;
    data?: string;
    to?: string;
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

        return await web3.eth.sendSignedTransaction((txObject as any).rawTransaction);
    }

    async send(method: any, txParams: ITxParams): Promise<TransactionReceipt> {
        if (txParams.privateKey !== '') {
            return await this.sendRaw(this.web3, txParams.privateKey, txParams);
        }

        return await method.send({
            from: txParams.from,
            gas: txParams.gas,
            gasPrice: txParams.gasPrice
        });
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

    async buildTransactionParams(method, params): Promise<ITxParams> {
        let gas;

        const networkGasPrice = await this.web3.eth.getGasPrice();

        if (params) {
            params.data = await method.encodeABI();

            if (params.privateKey) {
                const privateKey = params.privateKey.startsWith('0x')
                    ? params.privateKey
                    : '0x' + params.privateKey;
                    params.from = this.web3.eth.accounts.privateKeyToAccount(privateKey).address;
                params.nonce = params.nonce
                    ? params.nonce
                    : await this.web3.eth.getTransactionCount(params.from);
            }

            if (!params.gas) {
                try {
                    gas = await method.estimateGas({
                        from: params ? params.from : (await this.web3.eth.getAccounts())[0]
                    });
                } catch (ex) {
                    if (!(await getClientVersion(this.web3)).includes('Parity')) {
                        throw new Error(ex);
                    }

                    const errorResult = await this.getErrorMessage(this.web3, {
                        from: params ? params.from : (await this.web3.eth.getAccounts())[0],
                        to: this.web3Contract._address,
                        data: params.data,
                        gas: this.web3.utils.toHex(7000000)
                    });
                    throw new Error(errorResult);
                }
                gas = Math.round(gas * 2);

                params.gas = gas;
            }

            return {
                from: params.from ? params.from : (await this.web3.eth.getAccounts())[0],
                gas: params.gas ? params.gas : Math.round(gas * 1.1 + 21000),
                gasPrice: params.gasPrice ? params.gasPrice : networkGasPrice.toString(),
                nonce: params.nonce
                    ? params.nonce
                    : await this.web3.eth.getTransactionCount(params.from),
                data: params.data ? params.data : '',
                to: this.web3Contract._address,
                privateKey: params.privateKey ? params.privateKey : ''
            };
        } else {
            const fromAddress = (await this.web3.eth.getAccounts())[0];

            return {
                from: fromAddress,
                gas: Math.round(gas * 1.1 + 21000),
                gasPrice: networkGasPrice.toString(),
                nonce: await this.web3.eth.getTransactionCount(
                    (await this.web3.eth.getAccounts())[0]
                ),
                data: '',
                to: this.web3Contract._address,
                privateKey: ''
            };
        }
    }
}
