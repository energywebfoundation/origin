import { ExternalDeviceIdType } from './Device';

export type ISubRegion = string;

export interface IRegions {
    [region: string]: ISubRegion[];
}

export type IDeviceSubType = string;
export type IDeviceType = IDeviceSubType[];

export interface IContractsLookup {
    registry: string;
    issuer: string;
}

export interface IOriginConfiguration {
    contractsLookup: IContractsLookup;
    countryName?: string;
    currencies?: string[];
    regions?: IRegions;
    externalDeviceIdTypes?: ExternalDeviceIdType[];
    complianceStandard?: string;
    deviceTypes?: IDeviceType[];
}
