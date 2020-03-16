import { ExternalDeviceIdType } from "./Device";

export type ISubRegion = string;

export interface IRegions {
    [region: string]: ISubRegion[]
}

export type IDeviceType = string[];

export interface IOriginConfiguration {
    countryName?: string;
    currencies?: string[];
    regions?: IRegions;
    externalDeviceIdTypes?: ExternalDeviceIdType[];
    marketContractLookup?: string;
    complianceStandard?: string;
    deviceTypes?: IDeviceType[];
}
