import { GeneralFunctions, SpecialTx, SearchLog, getClientVersion } from './GeneralFunctions';
import * as fs from 'fs';
import * as path from 'path';
import Web3 = require('web3');
import { Tx, BlockType } from 'web3/eth/types';
import { TransactionReceipt, Logs } from 'web3/types';
import { JsonRPCResponse } from 'web3/providers';
import TestReceiverJSON from '../../build/contracts/TestReceiver.json';

export class TestReceiver extends GeneralFunctions {
    web3: Web3;
    buildFile = TestReceiverJSON;

    constructor(web3: Web3, address?: string) {
        super(
            address
                ? new web3.eth.Contract(TestReceiverJSON.abi, address)
                : new web3.eth.Contract(
                      TestReceiverJSON.abi,
                      (TestReceiverJSON as any).networks.length > 0
                          ? TestReceiverJSON.networks[0]
                          : null
                  )
        );
        this.web3 = web3;
    }

    async onERC721Received(
        _operator: string,
        _from: string,
        _tokenId: number,
        _data: string,
        txParams?: SpecialTx
    ) {
        let transactionParams;

        const txData = await this.web3Contract.methods
            .onERC721Received(_operator, _from, _tokenId, _data)
            .encodeABI();

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
                    gas = await this.web3Contract.methods
                        .onERC721Received(_operator, _from, _tokenId, _data)
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
            return await this.web3Contract.methods
                .onERC721Received(_operator, _from, _tokenId, _data)
                .send({ from: transactionParams.from, gas: transactionParams.gas });
        }
    }

    async safeTransferFrom(_from, _to, _entityId, _data?, txParams?: SpecialTx) {
        if (_data) {
            {
                let transactionParams;

                const txData = await this.web3Contract.methods
                    .safeTransferFrom(_from, _to, _entityId, _data)
                    .encodeABI();

                let gas;

                if (txParams) {
                    if (txParams.privateKey) {
                        const privateKey = txParams.privateKey.startsWith('0x')
                            ? txParams.privateKey
                            : '0x' + txParams.privateKey;
                        txParams.from = this.web3.eth.accounts.privateKeyToAccount(
                            privateKey
                        ).address;
                        txParams.nonce = txParams.nonce
                            ? txParams.nonce
                            : await this.web3.eth.getTransactionCount(txParams.from);
                    }

                    if (!txParams.gas) {
                        try {
                            gas = await this.web3Contract.methods
                                .safeTransferFrom(_from, _to, _entityId, _data)
                                .estimateGas({
                                    from: txParams
                                        ? txParams.from
                                        : (await this.web3.eth.getAccounts())[0]
                                });
                        } catch (ex) {
                            if (!(await getClientVersion(this.web3)).includes('Parity')) {
                                throw new Error(ex);
                            }

                            const errorResult = await this.getErrorMessage(this.web3, {
                                from: txParams
                                    ? txParams.from
                                    : (await this.web3.eth.getAccounts())[0],
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
                        from: txParams.from
                            ? txParams.from
                            : (await this.web3.eth.getAccounts())[0],
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

                    return await this.sendRaw(
                        this.web3,
                        transactionParams.privateKey,
                        transactionParams
                    );
                } else {
                    return await this.web3Contract.methods
                        .safeTransferFrom(_from, _to, _entityId, _data)
                        .send({ from: transactionParams.from, gas: transactionParams.gas });
                }
            }
        } else {
            let transactionParams;

            const txData = await this.web3Contract.methods
                .safeTransferFrom(_from, _to, _entityId)
                .encodeABI();

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
                        gas = await this.web3Contract.methods
                            .safeTransferFrom(_from, _to, _entityId)
                            .estimateGas({
                                from: txParams
                                    ? txParams.from
                                    : (await this.web3.eth.getAccounts())[0]
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

                return await this.sendRaw(
                    this.web3,
                    transactionParams.privateKey,
                    transactionParams
                );
            } else {
                return await this.web3Contract.methods
                    .safeTransferFrom(_from, _to, _entityId)
                    .send({ from: transactionParams.from, gas: transactionParams.gas });
            }
        }
    }

    async entityContract(txParams?: SpecialTx) {
        return await this.web3Contract.methods.entityContract().call(txParams);
    }
}
