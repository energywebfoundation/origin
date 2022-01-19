import { Signer } from 'ethers';
import { BlockchainProperties } from '../blockchain';

export abstract class SignerAdapter {
    abstract getSigner(blockchainProperties: BlockchainProperties): Promise<Signer>;
    abstract createSigner(
        blockchainNetId: number,
        platformOperatorPrivateKey: string
    ): Promise<void>;
}

export abstract class InternalSignerAdapter extends SignerAdapter {}
