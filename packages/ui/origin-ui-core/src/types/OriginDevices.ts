import { DeviceDTO } from '@energyweb/origin-device-registry-irec-form-api-client';

export interface IOriginDevice extends DeviceDTO {
    organizationName: string;
    locationText: string;
}
