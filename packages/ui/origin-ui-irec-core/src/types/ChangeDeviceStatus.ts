import { UpdateDeviceStatusDTO } from '@energyweb/origin-device-registry-irec-local-api-client';

export type ChangeDeviceStatus = {
    id: string;
    status: UpdateDeviceStatusDTO;
};
