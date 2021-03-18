import { OriginDeviceDTO } from '@energyweb/origin-device-registry-api-client';
import {
    DeviceDTO as IRecMyDeviceDTO,
    IrecDeviceDTO,
    PublicDeviceDTO as IRecPublicDeviceDTO
} from '@energyweb/origin-device-registry-irec-local-api-client';
import { ComposedDevice, ComposedPublicDevice } from '../types';

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

export function composeImportedDevices(
    iRecDevices: IRecMyDeviceDTO[],
    iRecDevicesNotInOrigin: IrecDeviceDTO[]
): IRecMyDeviceDTO[] {
    return [
        ...iRecDevices,
        ...iRecDevicesNotInOrigin.map((d) => {
            return {
                ...d,
                id: '',
                ownerId: '',
                timezone: '',
                gridOperator: ''
            };
        })
    ];
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
