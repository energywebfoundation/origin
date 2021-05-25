import {
    BlockchainProperties,
    BlockchainPropertiesModule,
    Certificate,
    CertificateModule,
    CertificationRequest
} from '@energyweb/issuer-api';
import { entities as OriginBackendEntities } from '@energyweb/origin-backend';
import { CertificationRequestModule, IrecCertificationRequest } from './';

export * from '@energyweb/issuer-api/dist/js/src/pods/certificate';
export * from '@energyweb/issuer-api/dist/js/src/pods/blockchain';

export * from '@energyweb/issuer-api/dist/js/src/utils';
export * from '@energyweb/issuer-api/dist/js/src/types';

export { BlockchainPropertiesService } from '@energyweb/issuer-api/dist/js/src/pods/blockchain/blockchain-properties.service';
export { AppModule, providers } from './app.module';
export * from './pods/certification-request';

export const entities = [
    Certificate,
    CertificationRequest,
    IrecCertificationRequest,
    BlockchainProperties
];
export const usedEntities = OriginBackendEntities;

export const modules = [CertificateModule, CertificationRequestModule, BlockchainPropertiesModule];
