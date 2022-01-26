import { Certificate, CertificateModule } from './pods/certificate';
import { BlockchainProperties, BlockchainPropertiesModule } from './pods/blockchain';
import { SignerEntity } from './pods/signer';
import { CertificationRequest, CertificationRequestModule } from './pods/certification-request';
import { UnminedCommitment } from './pods/certificate/unmined-commitment.entity';

export * from './pods/certificate';
export * from './pods/certification-request';
export * from './pods/blockchain';
export * from './pods/options';
export * from './pods/signer';
export * from './types';

export { BlockchainPropertiesService } from './pods/blockchain/blockchain-properties.service';
export { IssuerModule, providers } from './issuer.module';

export const entities = [
    Certificate,
    CertificationRequest,
    BlockchainProperties,
    UnminedCommitment,
    SignerEntity
];

export const modules = [CertificateModule, CertificationRequestModule, BlockchainPropertiesModule];
