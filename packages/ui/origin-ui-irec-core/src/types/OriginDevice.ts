import { IExternalDeviceId } from '@energyweb/origin-backend-core';

export type OriginDeviceDTO = {
    id: string;
    owner: string;
    externalRegistryId: string;
    smartMeterId: string;
    externalDeviceIds: IExternalDeviceId[];
    description: string;
    imageIds: string[];
};
