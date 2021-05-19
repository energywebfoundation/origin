import {
    Certificate,
    CertificateModule,
    BlockchainProperties,
    BlockchainPropertiesModule
} from '@energyweb/issuer-api';
import { entities as OriginBackendEntities } from '@energyweb/origin-backend';
import { CertificationRequest, CertificationRequestModule } from './';

export * from '@energyweb/issuer-api/src/pods/certificate';
export * from '@energyweb/issuer-api/src/pods/blockchain';
export * from '@energyweb/issuer-api/src/utils';
export * from '@energyweb/issuer-api/src/types';

export { BlockchainPropertiesService } from '@energyweb/issuer-api/src/pods/blockchain/blockchain-properties.service';
export { AppModule, providers } from './app.module';
export * from './pods/certification-request';

export const entities = [Certificate, CertificationRequest, BlockchainProperties];
export const usedEntities = OriginBackendEntities;

export const modules = [CertificateModule, CertificationRequestModule, BlockchainPropertiesModule];
