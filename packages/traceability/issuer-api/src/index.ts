import { Certificate, CertificateModule } from './pods/certificate';
import { BlockchainProperties, BlockchainPropertiesModule } from './pods/blockchain';
import { CertificationRequest, CertificationRequestModule } from './pods/certification-request';
import { UnminedCommitment } from './pods/certificate/unmined-commitment.entity';

export * from './pods/certificate';
export * from './pods/certification-request';
export * from './pods/blockchain';
export * from './types';

export { BlockchainPropertiesService } from './pods/blockchain/blockchain-properties.service';
export { IssuerModule, providers } from './issuer.module';

export const entities = [
    Certificate,
    CertificationRequest,
    BlockchainProperties,
    UnminedCommitment
];

export const modules = [CertificateModule, CertificationRequestModule, BlockchainPropertiesModule];
