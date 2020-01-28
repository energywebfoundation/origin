export interface IDevice {
    facilityName: string;
    description: string;
    images: string;
    address: string;
    region: string;
    province: string;
    country: number;
    operationalSince: number;
    capacityInW: number
    gpsLatitude: string;
    gpsLongitude: string;
    timezone: string;
    deviceType: string;
    complianceRegistry: string;
    otherGreenAttributes: string;
    typeOfPublicSupport: string;
}
