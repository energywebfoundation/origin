import { Certificate, CertificateModule } from './pods/certificate';
import { BlockchainProperties, BlockchainPropertiesModule } from './pods/blockchain';
import { CertificationRequest, CertificationRequestModule } from './pods/certification-request';
import { TransactionLog } from './pods/certificate/transaction-log.entity';

export * from './pods/certificate';
export * from './pods/certification-request';
export * from './pods/blockchain';
export * from './utils';
export * from './types';

export { BlockchainPropertiesService } from './pods/blockchain/blockchain-properties.service';
export { IssuerModule, providers } from './issuer.module';

export const entities = [Certificate, CertificationRequest, BlockchainProperties, TransactionLog];

export const modules = [CertificateModule, CertificationRequestModule, BlockchainPropertiesModule];
