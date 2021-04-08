import { Certificate, CertificateModule } from '@energyweb/issuer-api/src/pods/certificate';
import {
    BlockchainProperties,
    BlockchainPropertiesModule
} from '@energyweb/issuer-api/src/pods/blockchain';
import {
    CertificationRequest,
    CertificationRequestModule
} from '@energyweb/issuer-api/src/pods/certification-request';

export * from '@energyweb/issuer-api/src/pods/certificate';
export * from '@energyweb/issuer-api/src/pods/certification-request';
export * from '@energyweb/issuer-api/src/pods/blockchain';
export * from '@energyweb/issuer-api/src/utils';
export * from '@energyweb/issuer-api/src/types';

export { BlockchainPropertiesService } from '@energyweb/issuer-api/src/pods/blockchain/blockchain-properties.service';
export { AppModule, providers } from './app.module';

export const entities = [Certificate, CertificationRequest, BlockchainProperties];

export const modules = [CertificateModule, CertificationRequestModule, BlockchainPropertiesModule];
