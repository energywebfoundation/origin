import { ExternalDeviceIdType } from './Device';

export type ISubRegion = string;

export interface IRegions {
    [region: string]: ISubRegion[];
}

export type IDeviceSubType = string;
export type IDeviceType = IDeviceSubType[];

export interface IOriginConfiguration {
    countryName?: string;
    currencies?: string[];
    regions?: IRegions;
    externalDeviceIdTypes?: ExternalDeviceIdType[];
    complianceStandard?: string;
    deviceTypes?: IDeviceType[];
    gridOperators?: string[];
}
