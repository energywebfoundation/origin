import { CreateDeviceData, IRecCreateDeviceDTO, OriginCreateDeviceDTO } from '../types';

export function decomposeForIRec(newDevice: CreateDeviceData): IRecCreateDeviceDTO {
    const iRecCreateDevice = { ...newDevice };
    delete iRecCreateDevice.smartMeterId;
    delete iRecCreateDevice.description;
    delete iRecCreateDevice.externalDeviceIds;
    delete iRecCreateDevice.imageIds;

    return iRecCreateDevice;
}

export function decomposeForOrigin(newDevice: CreateDeviceData): OriginCreateDeviceDTO {
    return {
        externalRegistryId: null,
        smartMeterId: newDevice.smartMeterId,
        description: newDevice.description,
        externalDeviceIds: newDevice.externalDeviceIds,
        imageIds: newDevice.imageIds
    };
}
