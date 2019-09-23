import { Configuration as UtilsGeneralConfiguration } from '@energyweb/utils-general';
import { AssetProducingRegistryLogic, AssetConsumingRegistryLogic } from '@energyweb/asset-registry';
import { UserLogic } from '@energyweb/user-registry';
import { CertificateLogic } from '../wrappedContracts/CertificateLogic';

export type Configuration = UtilsGeneralConfiguration.Entity<
    any,
    AssetProducingRegistryLogic,
    AssetConsumingRegistryLogic,
    CertificateLogic,
    UserLogic
>;