import { DeviceDTO as OriginDeviceDTO } from '@energyweb/origin-device-registry-api-client';
import {
    DeviceDTO as IRecMyDeviceDTO,
    PublicDeviceDTO as IRecPublicDeviceDTO
} from '@energyweb/origin-device-registry-irec-local-api-client';
import { ComposedPublicDevice, ComposedDevice } from '../types';

export function composePublicDevices(
    originDevices: OriginDeviceDTO[],
    iRecDevices: IRecPublicDeviceDTO[]
): ComposedPublicDevice[] {
    const composedResult: ComposedPublicDevice[] = [];

    for (const originDevice of originDevices) {
        const matchingIRecDevice = iRecDevices.find(
            (device) => device.id === originDevice.externalRegistryId
        );
        composedResult.push({
            ...originDevice,
            ...matchingIRecDevice,
            id: originDevice.id
        });
    }
    return composedResult;
}

export function composeMyDevices(
    originDevices: OriginDeviceDTO[],
    iRecDevices: IRecMyDeviceDTO[]
): ComposedDevice[] {
    const composedResult: ComposedDevice[] = [];

    for (const originDevice of originDevices) {
        const matchingIRecDevice = iRecDevices.find(
            (device) => device.id === originDevice.externalRegistryId
        );
        composedResult.push({
            ...originDevice,
            ...matchingIRecDevice,
            id: originDevice.id
        });
    }
    return composedResult;
}

export function composeCreatedDevice(
    originDevice: OriginDeviceDTO,
    iRecDevice: IRecMyDeviceDTO
): ComposedDevice {
    return {
        ...originDevice,
        ...iRecDevice,
        id: originDevice.id
    };
}
