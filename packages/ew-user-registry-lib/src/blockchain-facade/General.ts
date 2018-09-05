import { Configuration } from './Configuration';

export namespace General {

    export async function createCertificateForAssetOwner(configuration: Configuration, wh: number, assetId: number) {

        const gas = await configuration.blockchainProperties.certificateLogicInstance.methods
            .createCertificateForAssetOwner(assetId, wh)
            .estimateGas({ from: configuration.blockchainProperties.matcherAccount.address });

        const tx = await configuration.blockchainProperties.certificateLogicInstance.methods
            .createCertificateForAssetOwner(assetId, wh)
            .send({ from: configuration.blockchainProperties.matcherAccount.address, gas: Math.round(gas * 1.1) });

        return tx;
    }

}