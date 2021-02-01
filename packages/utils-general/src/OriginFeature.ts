import { getEnumValues } from './utils';

export enum OriginFeature {
    Bundles = 'bundles',
    Exchange = 'exchange',
    Seller = 'seller',
    Buyer = 'buyer',
    Devices = 'devices',
    DevicesImport = 'devicesImport',
    Certificates = 'certificates',
    CertificationRequests = 'certificationRequests',
    IRec = 'irec',
    IRecConnect = 'irecConnect',
    IRecUIApp = 'iRecUIApp'
}

export const allOriginFeatures = getEnumValues(OriginFeature);
