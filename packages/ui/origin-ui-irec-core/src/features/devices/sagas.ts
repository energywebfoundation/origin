import { SagaIterator } from 'redux-saga';
import { all, fork, take, select, put, apply } from 'redux-saga/effects';
import { showNotification, NotificationType, setLoading } from '@energyweb/origin-ui-core';
import { DeviceClient } from '../../utils/client';
import { composePublicDevices, composeMyDevices, composeCreatedDevice } from '../../utils/compose';
import { decomposeForIRec, decomposeForOrigin } from '../../utils/decompose';
import {
    IRecDeviceDTO,
    OriginDeviceDTO,
    IRecPublicDeviceDTO,
    ComposedDevice,
    IRecCreateDeviceDTO,
    OriginCreateDeviceDTO
} from '../../types';
import { getDeviceClient } from '../general';
import { DevicesActions, storePublicDevices, storeMyDevices, ICreateDevice } from './actions';

function* getPublicDevices(): SagaIterator {
    while (true) {
        yield take(DevicesActions.fetchPublicDevices);

        const deviceClient: DeviceClient = yield select(getDeviceClient);
        const originClient = deviceClient?.originClient;
        const iRecClient = deviceClient?.iRecClient;

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
            const iRecDevices: IRecDeviceDTO[] = iRecResponse.data;

            const composed = composeMyDevices(originDevices, iRecDevices);
            yield put(storeMyDevices(composed));
        } catch (error) {
            showNotification(`Error while getting devices data`, NotificationType.Error);
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
            const createdIRecDevice: IRecDeviceDTO = yield apply(
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
    yield all([fork(getPublicDevices), fork(getMyDevices), fork(createNewDevice)]);
}
