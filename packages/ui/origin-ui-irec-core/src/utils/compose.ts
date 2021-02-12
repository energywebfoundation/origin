import {
    OriginDeviceDTO,
    IRecPublicDeviceDTO,
    IRecDeviceDTO,
    ComposedPublicDevice,
    ComposedDevice
} from '../types';

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
    iRecDevices: IRecDeviceDTO[]
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
    iRecDevice: IRecDeviceDTO
): ComposedDevice {
    return {
        ...originDevice,
        ...iRecDevice,
        id: originDevice.id
    };
}
