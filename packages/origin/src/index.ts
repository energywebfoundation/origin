import * as Certificate from './blockchain-facade/Certificate';
import { createBlockchainProperties } from './blockchain-facade/BlockchainPropertiesFactory';
import { CertificateLogic } from './wrappedContracts/CertificateLogic';
import { migrateCertificateRegistryContracts } from './utils/migrateContracts';

export {
    Certificate,
    createBlockchainProperties,
    migrateCertificateRegistryContracts,
    CertificateLogic
};
