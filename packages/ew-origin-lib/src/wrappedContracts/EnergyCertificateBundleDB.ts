import { GeneralFunctions, SpecialTx, SearchLog, getClientVersion } from './GeneralFunctions';
import * as fs from 'fs';
import * as path from 'path';
import Web3 = require('web3');
import { Tx, BlockType } from 'web3/eth/types';
import { TransactionReceipt, Logs } from 'web3/types';
import { JsonRPCResponse } from 'web3/providers';
import EnergyCertificateBundleDBJSON from '../../build/contracts/EnergyCertificateBundleDB.json';

export class EnergyCertificateBundleDB extends GeneralFunctions {
    web3: Web3;
    buildFile = EnergyCertificateBundleDBJSON;

    constructor(web3: Web3, address?: string) {
        super(
            address
                ? new web3.eth.Contract(EnergyCertificateBundleDBJSON.abi, address)
                : new web3.eth.Contract(
                      EnergyCertificateBundleDBJSON.abi,
                      (EnergyCertificateBundleDBJSON as any).networks.length > 0
                          ? EnergyCertificateBundleDBJSON.networks[0]
                          : null
                  )
        );
        this.web3 = web3;
    }

    async getAllLogChangeOwnerEvents(eventFilter?: SearchLog) {
        let filterParams;
        if (eventFilter) {
            filterParams = {
                fromBlock: eventFilter.fromBlock ? eventFilter.fromBlock : 0,
                toBlock: eventFilter.toBlock ? eventFilter.toBlock : 'latest'
            };
            if (eventFilter.topics) {
                filterParams.topics = eventFilter.topics;
            }
        } else {
            filterParams = {
                fromBlock: 0,
                toBlock: 'latest'
            };
        }

        return await this.web3Contract.getPastEvents('LogChangeOwner', filterParams);
    }

    async getAllEvents(eventFilter?: SearchLog) {
        let filterParams;
        if (eventFilter) {
            filterParams = {
                fromBlock: eventFilter.fromBlock ? eventFilter.fromBlock : 0,
                toBlock: eventFilter.toBlock ? eventFilter.toBlock : 'latest',
                topics: eventFilter.topics ? eventFilter.topics : [null]
            };
        } else {
            filterParams = {
                fromBlock: 0,
                toBlock: 'latest',
                topics: [null]
            };
        }

        return await this.web3Contract.getPastEvents('allEvents', filterParams);
    }

    async getTradableEntityOwner(_entityId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getTradableEntityOwner(_entityId).call(txParams);
    }

    async getApproved(_entityId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getApproved(_entityId).call(txParams);
    }

    async addEscrowForEntity(_entityId: number, _escrow: string, txParams?: SpecialTx) {
        let transactionParams;

        const txData = await this.web3Contract.methods
            .addEscrowForEntity(_entityId, _escrow)
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
                        .addEscrowForEntity(_entityId, _escrow)
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
                .addEscrowForEntity(_entityId, _escrow)
                .send({ from: transactionParams.from, gas: transactionParams.gas });
        }
    }

    async setTradableEntityEscrowExternal(
        _entityId: number,
        _escrow: string[],
        txParams?: SpecialTx
    ) {
        let transactionParams;

        const txData = await this.web3Contract.methods
            .setTradableEntityEscrowExternal(_entityId, _escrow)
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
                        .setTradableEntityEscrowExternal(_entityId, _escrow)
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
                .setTradableEntityEscrowExternal(_entityId, _escrow)
                .send({ from: transactionParams.from, gas: transactionParams.gas });
        }
    }

    async getTradableEntityEscrowLength(_entityId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods
            .getTradableEntityEscrowLength(_entityId)
            .call(txParams);
    }

    async getBundleListLength(txParams?: SpecialTx) {
        return await this.web3Contract.methods.getBundleListLength().call(txParams);
    }

    async setDataLog(_certificateId: number, _newDataLog: string, txParams?: SpecialTx) {
        let transactionParams;

        const txData = await this.web3Contract.methods
            .setDataLog(_certificateId, _newDataLog)
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
                        .setDataLog(_certificateId, _newDataLog)
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
                .setDataLog(_certificateId, _newDataLog)
                .send({ from: transactionParams.from, gas: transactionParams.gas });
        }
    }

    async getOwnerChangeCounter(_certificateId: number, txParams?: SpecialTx) {
        let transactionParams;

        const txData = await this.web3Contract.methods
            .getOwnerChangeCounter(_certificateId)
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
                        .getOwnerChangeCounter(_certificateId)
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
                .getOwnerChangeCounter(_certificateId)
                .send({ from: transactionParams.from, gas: transactionParams.gas });
        }
    }

    async getBundle(_bundleID: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getBundle(_bundleID).call(txParams);
    }

    async getRetired(_certificateId: number, txParams?: SpecialTx) {
        let transactionParams;

        const txData = await this.web3Contract.methods.getRetired(_certificateId).encodeABI();

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
                    gas = await this.web3Contract.methods.getRetired(_certificateId).estimateGas({
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
                .getRetired(_certificateId)
                .send({ from: transactionParams.from, gas: transactionParams.gas });
        }
    }

    async setTradableEntityOwnerAndAddApproval(
        _entityId: number,
        _owner: string,
        _approve: string,
        txParams?: SpecialTx
    ) {
        let transactionParams;

        const txData = await this.web3Contract.methods
            .setTradableEntityOwnerAndAddApproval(_entityId, _owner, _approve)
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
                        .setTradableEntityOwnerAndAddApproval(_entityId, _owner, _approve)
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
                .setTradableEntityOwnerAndAddApproval(_entityId, _owner, _approve)
                .send({ from: transactionParams.from, gas: transactionParams.gas });
        }
    }

    async setOwnerChangeCounter(
        _certificateId: number,
        _newOwnerChangeCounter: number,
        txParams?: SpecialTx
    ) {
        let transactionParams;

        const txData = await this.web3Contract.methods
            .setOwnerChangeCounter(_certificateId, _newOwnerChangeCounter)
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
                        .setOwnerChangeCounter(_certificateId, _newOwnerChangeCounter)
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
                .setOwnerChangeCounter(_certificateId, _newOwnerChangeCounter)
                .send({ from: transactionParams.from, gas: transactionParams.gas });
        }
    }

    async addApprovalExternal(_entityId: number, _approve: string, txParams?: SpecialTx) {
        let transactionParams;

        const txData = await this.web3Contract.methods
            .addApprovalExternal(_entityId, _approve)
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
                        .addApprovalExternal(_entityId, _approve)
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
                .addApprovalExternal(_entityId, _approve)
                .send({ from: transactionParams.from, gas: transactionParams.gas });
        }
    }

    async setOnChainDirectPurchasePrice(_entityId: number, _price: number, txParams?: SpecialTx) {
        let transactionParams;

        const txData = await this.web3Contract.methods
            .setOnChainDirectPurchasePrice(_entityId, _price)
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
                        .setOnChainDirectPurchasePrice(_entityId, _price)
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
                .setOnChainDirectPurchasePrice(_entityId, _price)
                .send({ from: transactionParams.from, gas: transactionParams.gas });
        }
    }

    async getOwnerToOperators(_company: string, _escrow: string, txParams?: SpecialTx) {
        return await this.web3Contract.methods
            .getOwnerToOperators(_company, _escrow)
            .call(txParams);
    }

    async setTradableEntityOwnerExternal(_entityId: number, _owner: string, txParams?: SpecialTx) {
        let transactionParams;

        const txData = await this.web3Contract.methods
            .setTradableEntityOwnerExternal(_entityId, _owner)
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
                        .setTradableEntityOwnerExternal(_entityId, _owner)
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
                .setTradableEntityOwnerExternal(_entityId, _owner)
                .send({ from: transactionParams.from, gas: transactionParams.gas });
        }
    }

    async getTradableEntity(_entityId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getTradableEntity(_entityId).call(txParams);
    }

    async addChildrenExternal(_certificateId: number, _childId: number, txParams?: SpecialTx) {
        let transactionParams;

        const txData = await this.web3Contract.methods
            .addChildrenExternal(_certificateId, _childId)
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
                        .addChildrenExternal(_certificateId, _childId)
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
                .addChildrenExternal(_certificateId, _childId)
                .send({ from: transactionParams.from, gas: transactionParams.gas });
        }
    }

    async owner(txParams?: SpecialTx) {
        return await this.web3Contract.methods.owner().call(txParams);
    }

    async getCertificateSpecific(_certificateId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods
            .getCertificateSpecific(_certificateId)
            .call(txParams);
    }

    async getBalanceOf(_owner: string, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getBalanceOf(_owner).call(txParams);
    }

    async setRetired(_certificateId: number, _retired: boolean, txParams?: SpecialTx) {
        let transactionParams;

        const txData = await this.web3Contract.methods
            .setRetired(_certificateId, _retired)
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
                        .setRetired(_certificateId, _retired)
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
                .setRetired(_certificateId, _retired)
                .send({ from: transactionParams.from, gas: transactionParams.gas });
        }
    }

    async setMaxOwnerChanges(
        _certificateId: number,
        _newMaxOwnerChanges: number,
        txParams?: SpecialTx
    ) {
        let transactionParams;

        const txData = await this.web3Contract.methods
            .setMaxOwnerChanges(_certificateId, _newMaxOwnerChanges)
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
                        .setMaxOwnerChanges(_certificateId, _newMaxOwnerChanges)
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
                .setMaxOwnerChanges(_certificateId, _newMaxOwnerChanges)
                .send({ from: transactionParams.from, gas: transactionParams.gas });
        }
    }

    async changeOwner(_newOwner: string, txParams?: SpecialTx) {
        let transactionParams;

        const txData = await this.web3Contract.methods.changeOwner(_newOwner).encodeABI();

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
                    gas = await this.web3Contract.methods.changeOwner(_newOwner).estimateGas({
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
                .changeOwner(_newOwner)
                .send({ from: transactionParams.from, gas: transactionParams.gas });
        }
    }

    async getMaxOwnerChanges(_certificateId: number, txParams?: SpecialTx) {
        let transactionParams;

        const txData = await this.web3Contract.methods
            .getMaxOwnerChanges(_certificateId)
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
                        .getMaxOwnerChanges(_certificateId)
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
                .getMaxOwnerChanges(_certificateId)
                .send({ from: transactionParams.from, gas: transactionParams.gas });
        }
    }

    async removeTokenAndPrice(_entityId: number, txParams?: SpecialTx) {
        let transactionParams;

        const txData = await this.web3Contract.methods.removeTokenAndPrice(_entityId).encodeABI();

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
                        .removeTokenAndPrice(_entityId)
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
                .removeTokenAndPrice(_entityId)
                .send({ from: transactionParams.from, gas: transactionParams.gas });
        }
    }

    async addChildren(_certificateId: number, _childId: number, txParams?: SpecialTx) {
        let transactionParams;

        const txData = await this.web3Contract.methods
            .addChildren(_certificateId, _childId)
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
                        .addChildren(_certificateId, _childId)
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
                .addChildren(_certificateId, _childId)
                .send({ from: transactionParams.from, gas: transactionParams.gas });
        }
    }

    async setCertificateSpecific(_certificateId: number, _certificate: any, txParams?: SpecialTx) {
        let transactionParams;

        const txData = await this.web3Contract.methods
            .setCertificateSpecific(_certificateId, _certificate)
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
                        .setCertificateSpecific(_certificateId, _certificate)
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
                .setCertificateSpecific(_certificateId, _certificate)
                .send({ from: transactionParams.from, gas: transactionParams.gas });
        }
    }

    async setOwnerToOperators(
        _company: string,
        _escrow: string,
        _allowed: boolean,
        txParams?: SpecialTx
    ) {
        let transactionParams;

        const txData = await this.web3Contract.methods
            .setOwnerToOperators(_company, _escrow, _allowed)
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
                        .setOwnerToOperators(_company, _escrow, _allowed)
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
                .setOwnerToOperators(_company, _escrow, _allowed)
                .send({ from: transactionParams.from, gas: transactionParams.gas });
        }
    }

    async getCertificateChildrenLength(_certificateId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods
            .getCertificateChildrenLength(_certificateId)
            .call(txParams);
    }

    async removeEscrow(_entityId: number, _escrow: string, txParams?: SpecialTx) {
        let transactionParams;

        const txData = await this.web3Contract.methods.removeEscrow(_entityId, _escrow).encodeABI();

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
                        .removeEscrow(_entityId, _escrow)
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
                .removeEscrow(_entityId, _escrow)
                .send({ from: transactionParams.from, gas: transactionParams.gas });
        }
    }

    async setTradableEntity(_entityId: number, _entity: any, txParams?: SpecialTx) {
        let transactionParams;

        const txData = await this.web3Contract.methods
            .setTradableEntity(_entityId, _entity)
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
                        .setTradableEntity(_entityId, _entity)
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
                .setTradableEntity(_entityId, _entity)
                .send({ from: transactionParams.from, gas: transactionParams.gas });
        }
    }

    async setTradableToken(_entityId: number, _token: string, txParams?: SpecialTx) {
        let transactionParams;

        const txData = await this.web3Contract.methods
            .setTradableToken(_entityId, _token)
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
                        .setTradableToken(_entityId, _token)
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
                .setTradableToken(_entityId, _token)
                .send({ from: transactionParams.from, gas: transactionParams.gas });
        }
    }

    async getOnChainDirectPurchasePrice(_entityId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods
            .getOnChainDirectPurchasePrice(_entityId)
            .call(txParams);
    }

    async getDataLog(_certificateId: number, txParams?: SpecialTx) {
        let transactionParams;

        const txData = await this.web3Contract.methods.getDataLog(_certificateId).encodeABI();

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
                    gas = await this.web3Contract.methods.getDataLog(_certificateId).estimateGas({
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
                .getDataLog(_certificateId)
                .send({ from: transactionParams.from, gas: transactionParams.gas });
        }
    }

    async getTradableToken(_entityId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getTradableToken(_entityId).call(txParams);
    }

    async createEnergyCertificateBundle(
        _tradableEntity: any,
        _certificateSpecific: any,
        txParams?: SpecialTx
    ) {
        let transactionParams;

        const txData = await this.web3Contract.methods
            .createEnergyCertificateBundle(_tradableEntity, _certificateSpecific)
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
                        .createEnergyCertificateBundle(_tradableEntity, _certificateSpecific)
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
                .createEnergyCertificateBundle(_tradableEntity, _certificateSpecific)
                .send({ from: transactionParams.from, gas: transactionParams.gas });
        }
    }
}
