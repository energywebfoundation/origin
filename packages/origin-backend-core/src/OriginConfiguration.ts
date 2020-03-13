import { ExternalDeviceIdType } from "./Device";

export interface IOriginConfiguration {
    countryName?: string;
    currencies?: string[];
    regions?: string;
    externalDeviceIdTypes?: ExternalDeviceIdType[];
    marketContractLookup?: string;
    complianceStandard?: string;
    deviceTypes?: string;
}