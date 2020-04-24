import ethSigUtil from 'eth-sig-util';
import { JsonRpcProvider } from 'ethers/providers';

export async function recoverTypedSignatureAddress(text: string, signedMessage: string) {
    const data = {
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

    return ethSigUtil.recoverTypedSignature({
        sig: signedMessage,
        data
    });
}

export async function signTypedMessage(
    from: string,
    text: string,
    web3: JsonRpcProvider
): Promise<string> {
    const data = {
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

    return web3.send('eth_signTypedData_v4', [from, JSON.stringify(data)]);
}
