import Web3 from 'web3';
import ethSigUtil from 'eth-sig-util';

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
    web3: Web3,
    privateKey?: string
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

    if (privateKey) {
        const privateKeyAsBuffer = Buffer.from(
            privateKey.startsWith('0x') ? privateKey.substring(2, privateKey.length) : privateKey,
            'hex'
        );

        return (ethSigUtil as any).signTypedData_v4(privateKeyAsBuffer, { data });
    }

    return new Promise((resolve, reject) => {
        (web3.currentProvider as any).sendAsync(
            {
                method: 'eth_signTypedData_v4',
                params: [from, JSON.stringify(data)],
                from
            },
            (error: any, result: any) => {
                if (error ?? result?.error) return reject(error ?? result?.error?.message);

                resolve(result?.result);
            }
        );
    });
}
