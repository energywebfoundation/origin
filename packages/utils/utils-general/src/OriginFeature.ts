import { getEnumValues } from './utils';

export enum OriginFeature {
    Bundles = 'bundles',
    Exchange = 'exchange',
    Seller = 'seller',
    Buyer = 'buyer',
    Devices = 'devices',
    DevicesImport = 'devicesImport',
    Certificates = 'certificates',
    CertificatesImport = 'certificatesImport',
    CertificationRequests = 'certificationRequests',
    IRec = 'irec',
    IRecConnect = 'irecConnect',
    IRecUIApp = 'iRecUIApp',
    NewInboxes = 'newInboxes'
}

export const allOriginFeatures = getEnumValues(OriginFeature);
