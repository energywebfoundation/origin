import { SagaIterator } from 'redux-saga';
import { all, apply, fork, put, select, take } from 'redux-saga/effects';
import { NotificationType, setLoading, showNotification } from '@energyweb/origin-ui-core';
import {
    NewDeviceDTO as OriginCreateDeviceDTO,
    OriginDeviceDTO
} from '@energyweb/origin-device-registry-api-client';
import {
    CreateDeviceDTO as IRecCreateDeviceDTO,
    DeviceDTO as IRecMyDeviceDTO,
    PublicDeviceDTO as IRecPublicDeviceDTO,
    IrecDeviceDTO
} from '@energyweb/origin-device-registry-irec-local-api-client';
import { DeviceClient } from '../../utils/client';
import {
    composeCreatedDevice,
    composeImportedDevices,
    composeMyDevices,
    composePublicDevices
} from '../../utils/compose';
import { decomposeForIRec, decomposeForOrigin } from '../../utils/decompose';
import { ComposedDevice } from '../../types';
import { getDeviceClient } from '../general';
import {
    DevicesActions,
    ICreateDevice,
    storeIrecDevicesToImport,
    storeMyDevices,
    storePublicDevices
} from './actions';

function* getPublicDevices(): SagaIterator {
    while (true) {
        yield take(DevicesActions.fetchPublicDevices);

        const deviceClient: DeviceClient = yield select(getDeviceClient);
        const originClient = deviceClient.originClient;
        const iRecClient = deviceClient.iRecClient;

        try {
            const [originResponse, iRecResponse] = yield all([
                yield apply(originClient, originClient.getAll, null),
                yield apply(iRecClient, iRecClient.getAll, null)
            ]);
            const originDevices: OriginDeviceDTO[] = originResponse.data;
            const iRecDevices: IRecPublicDeviceDTO[] = iRecResponse.data;
            const composed = composePublicDevices(originDevices, iRecDevices);

            yield put(storePublicDevices(composed));
        } catch (error) {
            showNotification(`Error while getting devices data`, NotificationType.Error);
            console.log(error);
        }
    }
}

function* getMyDevices(): SagaIterator {
    while (true) {
        yield take(DevicesActions.fetchMyDevices);

        const deviceClient: DeviceClient = yield select(getDeviceClient);
        const originClient = deviceClient.originClient;
        const iRecClient = deviceClient.iRecClient;

        try {
            const [originResponse, iRecResponse] = yield all([
                yield apply(originClient, originClient.getMyDevices, null),
                yield apply(iRecClient, iRecClient.getMyDevices, null)
            ]);

            const originDevices: OriginDeviceDTO[] = originResponse.data;
            const iRecDevices: IRecMyDeviceDTO[] = iRecResponse.data;

            const composed = composeMyDevices(originDevices, iRecDevices);
            yield put(storeMyDevices(composed));
        } catch (error) {
            showNotification(`Error while getting devices data`, NotificationType.Error);
            console.log(error);
        }
    }
}

function* getDevicesToImport(): SagaIterator {
    while (true) {
        yield take(DevicesActions.fetchDevicesToImport);

        const deviceClient: DeviceClient = yield select(getDeviceClient);
        const originClient = deviceClient.originClient;
        const iRecClient = deviceClient.iRecClient;

        try {
            const [originResponse, iRecDevicesResponse, iRecDevicesToImportResponse] = yield all([
                yield apply(originClient, originClient.getMyDevices, null),
                yield apply(iRecClient, iRecClient.getMyDevices, null),
                yield apply(iRecClient, iRecClient.getDevicesToImportFromIrec, null)
            ]);

            const originDevices: OriginDeviceDTO[] = originResponse.data;
            const iRecDevices: IRecMyDeviceDTO[] = iRecDevicesResponse.data;
            const iRecDevicesToImport: IrecDeviceDTO[] = iRecDevicesToImportResponse.data;

            const iRecDevicesNotInOrigin: IRecMyDeviceDTO[] = iRecDevices.filter((device) => {
                return !originDevices.find((d) => d.externalRegistryId === device.id);
            });

            const composed = composeImportedDevices(iRecDevicesNotInOrigin, iRecDevicesToImport);
            yield put(storeIrecDevicesToImport(composed));
        } catch (error) {
            showNotification(`Error while getting devices to import data`, NotificationType.Error);
            console.log(error);
        }
    }
}

function* createNewDevice(): SagaIterator {
    while (true) {
        yield put(setLoading(true));
        const { payload: newDevice }: ICreateDevice = yield take(DevicesActions.createDevice);

        const deviceClient: DeviceClient = yield select(getDeviceClient);
        const originClient = deviceClient.originClient;
        const iRecClient = deviceClient.iRecClient;
        const myDevices = yield select(getMyDevices);

        const iRecCreateData: IRecCreateDeviceDTO = decomposeForIRec(newDevice);
        const originCreateData: OriginCreateDeviceDTO = decomposeForOrigin(newDevice);

        try {
            const createdIRecDevice: IRecMyDeviceDTO = yield apply(
                iRecClient,
                iRecClient.createDevice,
                [iRecCreateData]
            );
            originCreateData.externalRegistryId = createdIRecDevice.id;

            const createdOriginDevice: OriginDeviceDTO = yield apply(
                originClient,
                originClient.createDevice,
                [originCreateData]
            );

            const composedCreatedDevice: ComposedDevice = composeCreatedDevice(
                createdOriginDevice,
                createdIRecDevice
            );

            yield put(storeMyDevices([...myDevices, composedCreatedDevice]));
            showNotification(`New device successfully created.`, NotificationType.Success);
        } catch (error) {
            showNotification(`Error while creating new device`, NotificationType.Error);
            console.log(error);
        }
        yield put(setLoading(false));
    }
}

export function* iRecDevicesSaga(): SagaIterator {
    yield all([
        fork(getPublicDevices),
        fork(getMyDevices),
        fork(createNewDevice),
        fork(getDevicesToImport)
    ]);
}
