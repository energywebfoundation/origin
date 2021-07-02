import {
    BlockchainProperties,
    BlockchainPropertiesModule,
    Certificate,
    CertificateModule,
    CertificationRequest
} from '@energyweb/issuer-api';
import { entities as OriginBackendEntities } from '@energyweb/origin-backend';
import { entities as OrganizationEntities } from '@energyweb/origin-organization-irec-api';

import { CertificationRequestModule, IrecCertificationRequest } from './pods/certification-request';
import { IrecCertificate } from './pods/certificate';

export * from '@energyweb/issuer-api/dist/js/src/pods/blockchain';
export * from '@energyweb/issuer-api/dist/js/src/pods/certification-request/certification-request.entity';
export * from '@energyweb/issuer-api/dist/js/src/utils';
export * from '@energyweb/issuer-api/dist/js/src/types';

export { BlockchainPropertiesService } from '@energyweb/issuer-api/dist/js/src/pods/blockchain/blockchain-properties.service';
export { AppModule, providers } from './app.module';
export * from './pods/certification-request';
export * from './pods/certificate';

export const usedEntities = [...OriginBackendEntities, ...OrganizationEntities];
export const entities = [
    Certificate,
    CertificationRequest,
    IrecCertificationRequest,
    BlockchainProperties,
    IrecCertificate,
    ...usedEntities
];
export const usedEntities = [...OriginBackendEntities, ...OrganizationEntities];

export const modules = [CertificateModule, CertificationRequestModule, BlockchainPropertiesModule];
