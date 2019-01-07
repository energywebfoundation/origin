import { Tx } from './types/types';

export async function deploy(web3, byteCode: string, txParams?: Tx): Promise<any> {
    return new Promise<any>(async (resolve) => {

        if (byteCode.length === 0) throw new Error('no bytecode provided');

        if (txParams && txParams.privateKey) {
            const privateKey = txParams.privateKey.startsWith('0x') ? txParams.privateKey : '0x' + txParams.privateKey;
            txParams.from = web3.eth.accounts.privateKeyToAccount(privateKey).address;
            txParams.nonce = txParams.nonce ? txParams.nonce : (await web3.eth.getTransactionCount(txParams.from));

            const transactionParams = {
                data: byteCode.startsWith('0x') ? byteCode : '0x' + byteCode,
                from: txParams.from ? txParams.from : (await web3.eth.getAccounts())[0],
                gas: txParams.gas ? txParams.gas : (await web3.eth.getBlock('latest')).gasLimit,
                gasPrice: txParams.gasPrice ? txParams.gasPrice : await web3.eth.getGasPrice(),
                nonce: txParams.nonce ? txParams.nonce : (await web3.eth.getTransactionCount(txParams.from ? txParams.from : (await web3.eth.getAccounts())[0])),
                to: '',
                value: txParams.value ? txParams.value : 0,
            };
            const signedTx = await web3.eth.accounts.signTransaction(transactionParams, txParams.privateKey);

            resolve(await web3.eth.sendSignedTransaction(signedTx.rawTransaction));
        }

    });
}
