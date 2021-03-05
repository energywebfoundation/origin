import { useContext, createContext } from 'react';
import { useSelector } from 'react-redux';
import { DeviceClient as FormDeviceClient } from '@energyweb/origin-device-registry-irec-form-api-client';
import {
    DeviceDataLayers,
    getAllDevices as getAllFormDevices,
    getMyDevices as getMyFormDevices,
    fetchAllDevices as fetchAllFormDevices,
    fetchMyDevices as fetchMyFormDevices,
    ICoreState,
    getBackendClient,
    BackendClient
} from '@energyweb/origin-ui-core';
import {
    getAllDevices as getAllIRecDevices,
    getMyDevices as getMyIRecDevices,
    fetchPublicDevices as fetchAllIRecDevices,
    fetchMyDevices as fetchMyIRecDevices,
    getDeviceClient as getIRecDeviceClient,
    DeviceClient as IRecDeviceClient,
    IIRecAppState
} from '@energyweb/origin-ui-irec-core';
import { PublicDevice, MyDevice } from './types';

export interface IDeviceDataLayerContext {
    getAllDevices: (state: ICoreState | IIRecAppState) => PublicDevice[];
    getMyDevices: (state: ICoreState | IIRecAppState) => MyDevice[];
    fetchAllDevices: () => void;
    fetchMyDevices: () => void;
    deviceClient: FormDeviceClient | IRecDeviceClient;
}

type TDeviceClientSelector = (
    state: ICoreState | IIRecAppState
) => BackendClient | IRecDeviceClient;

export const deviceDataLayerSelector = (layer: DeviceDataLayers) => {
    const deviceClientSelector: TDeviceClientSelector =
        layer === DeviceDataLayers.IRecDevice ? getIRecDeviceClient : getBackendClient;

    const client = useSelector(deviceClientSelector);

    if (layer === DeviceDataLayers.IRecDevice) {
        return {
            getAllDevices: getAllIRecDevices,
            getMyDevices: getMyIRecDevices,
            fetchAllDevices: fetchAllIRecDevices,
            fetchMyDevices: fetchMyIRecDevices,
            deviceClient: client as IRecDeviceClient
        };
    }

    return {
        getAllDevices: getAllFormDevices,
        getMyDevices: getMyFormDevices,
        fetchAllDevices: fetchAllFormDevices,
        fetchMyDevices: fetchMyFormDevices,
        deviceClient: (client as BackendClient)?.deviceClient
    };
};

export const DataLayerContext: React.Context<IDeviceDataLayerContext> = createContext<IDeviceDataLayerContext>(
    null
);

export const useDeviceDataLayer = (): IDeviceDataLayerContext => {
    return useContext(DataLayerContext);
};
