import { getEnumValues } from './utils';

export enum OriginFeature {
    Bundles = 'bundles',
    Exchange = 'exchange',
    Seller = 'seller',
    Buyer = 'buyer',
    Devices = 'devices',
    Certificates = 'certificates',
    CertificationRequests = 'certificationRequests',
    IRec = 'irec',
    IRecConnect = 'irecConnect'
}

export const allOriginFeatures = getEnumValues(OriginFeature);
