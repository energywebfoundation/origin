import { Certificate, CertificateModule } from './pods/certificate';
import { BlockchainProperties, BlockchainPropertiesModule } from './pods/blockchain';
import { CertificationRequest, CertificationRequestModule } from './pods/certification-request';

export * from './pods/certificate';
export * from './pods/certification-request';
export * from './pods/blockchain';
export * from './types';

export { BlockchainPropertiesService } from './pods/blockchain/blockchain-properties.service';
export { AppModule, providers } from './app.module';

export const entities = [Certificate, CertificationRequest, BlockchainProperties];

export const modules = [CertificateModule, CertificationRequestModule, BlockchainPropertiesModule];
