import ethSigUtil from 'eth-sig-util';
import { providers } from 'ethers';

const getData = (text: string): ethSigUtil.EIP712TypedData => {
    return {
        types: {
            EIP712Domain: [
                { name: 'name', type: 'string' },
                { name: 'version', type: 'string' }
            ],
            TextInformation: [{ name: 'text', type: 'string' }]
        },
        domain: {
            name: 'Origin',
            version: '2'
        },
        primaryType: 'TextInformation',
        message: {
            text
        }
    };
};

export async function recoverTypedSignatureAddress(text: string, signedMessage: string) {
    return ethSigUtil.recoverTypedSignature({
        sig: signedMessage,
        data: getData(text)
    });
}

export async function signTypedMessage(
    from: string,
    text: string,
    web3: providers.JsonRpcProvider
): Promise<string> {
    return web3.send('eth_signTypedData_v4', [from, JSON.stringify(getData(text))]);
}

export async function signTypedMessagePrivateKey(
    privateKey: string,
    text: string
): Promise<string> {
    return ethSigUtil.signTypedData(Buffer.from(privateKey, 'hex'), { data: getData(text) });
}
