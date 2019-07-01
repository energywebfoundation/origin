import { GeneralFunctions, SpecialTx, SearchLog, getClientVersion } from './GeneralFunctions';
import Web3 = require('web3');
import AssetContractLookupJSON from '../../build/contracts/AssetContractLookup.json';

export class AssetContractLookup extends GeneralFunctions {
    web3: Web3;
    buildFile = AssetContractLookupJSON;

    constructor(web3: Web3, address?: string) {
        super(
            address
                ? new web3.eth.Contract(AssetContractLookupJSON.abi, address)
                : new web3.eth.Contract(
                      AssetContractLookupJSON.abi,
                      (AssetContractLookupJSON as any).networks.length > 0
                          ? AssetContractLookupJSON.networks[0]
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

    async assetProducingRegistry(txParams?: SpecialTx) {
        return await this.web3Contract.methods.assetProducingRegistry().call(txParams);
    }

    async init(
        _userRegistry: string,
        _assetProducingRegistry: string,
        _assetConsumingRegistry: string,
        _assetProducingDB: string,
        _assetConsumingDB: string,
        txParams?: SpecialTx
    ) {
        let transactionParams;

        const txData = await this.web3Contract.methods
            .init(
                _userRegistry,
                _assetProducingRegistry,
                _assetConsumingRegistry,
                _assetProducingDB,
                _assetConsumingDB
            )
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
                        .init(
                            _userRegistry,
                            _assetProducingRegistry,
                            _assetConsumingRegistry,
                            _assetProducingDB,
                            _assetConsumingDB
                        )
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
                .init(
                    _userRegistry,
                    _assetProducingRegistry,
                    _assetConsumingRegistry,
                    _assetProducingDB,
                    _assetConsumingDB
                )
                .send({ from: transactionParams.from, gas: transactionParams.gas });
        }
    }

    async assetConsumingRegistry(txParams?: SpecialTx) {
        return await this.web3Contract.methods.assetConsumingRegistry().call(txParams);
    }

    async userRegistry(txParams?: SpecialTx) {
        return await this.web3Contract.methods.userRegistry().call(txParams);
    }

    async maxMatcherPerAsset(txParams?: SpecialTx) {
        return await this.web3Contract.methods.maxMatcherPerAsset().call(txParams);
    }

    async owner(txParams?: SpecialTx) {
        return await this.web3Contract.methods.owner().call(txParams);
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

    async update(
        _assetProducingRegistry: string,
        _assetConsumingRegistry: string,
        txParams?: SpecialTx
    ) {
        let transactionParams;

        const txData = await this.web3Contract.methods
            .update(_assetProducingRegistry, _assetConsumingRegistry)
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
                        .update(_assetProducingRegistry, _assetConsumingRegistry)
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
                .update(_assetProducingRegistry, _assetConsumingRegistry)
                .send({ from: transactionParams.from, gas: transactionParams.gas });
        }
    }
}
