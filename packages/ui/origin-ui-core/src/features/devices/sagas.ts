import { SagaIterator } from 'redux-saga';
import { all, fork, take, select, apply, put } from 'redux-saga/effects';
import { getI18n } from 'react-i18next';
import { push } from 'connected-react-router';
import { DeviceStatus } from '@energyweb/origin-backend-core';
import { OrganizationClient } from '@energyweb/origin-backend-client';
import { DeviceClient, DeviceDTO } from '@energyweb/origin-device-registry-irec-form-api-client';
import { showNotification, NotificationType } from '../../utils/notifications';
import { BackendClient } from '../../utils/clients';
import { getDevicesOwnedLink, getBaseURL } from '../../utils/routing';
import { getDeviceLocationText } from '../../utils/device';
import { IOriginDevice } from '../../types';
import { getDeviceClient, getBackendClient, setLoading } from '../general';
import {
    DevicesActions,
    storeAllDevices,
    storeMyDevices,
    fetchMyDevices,
    clearAllDevices,
    clearMyDevices,
    fetchAllDevices,
    addReadsAllDevices,
    addReadsMyDevices
} from './actions';
import { ICreateDeviceAction, IApproveDeviceAction } from './types';

function* fetchAndFormatAllDevices(): SagaIterator {
    while (true) {
        yield take(DevicesActions.FETCH_ALL_DEVICES);

        const deviceClient: DeviceClient = yield select(getDeviceClient);
        const backendClient: BackendClient = yield select(getBackendClient);
        const organizationClient: OrganizationClient = backendClient.organizationClient;
        const i18n = getI18n();

        const allOrgIds = new Set<number>();
        const orgNames = new Map<number, string>();

        try {
            const { data: allDevices }: { data: DeviceDTO[] } = yield apply(
                deviceClient,
                deviceClient.getAll,
                null
            );

            allDevices.forEach((device) => allOrgIds.add(device.organizationId));
            for (const id of allOrgIds) {
                const {
                    data: { name }
                } = yield apply(organizationClient, organizationClient.getPublic, [id]);
                orgNames.set(id, name);
            }

            const devicesWithOrg: IOriginDevice[] = allDevices.map((device) => ({
                ...device,
                organizationName: orgNames.get(device.organizationId),
                locationText: getDeviceLocationText(device)
            }));
            yield put(clearAllDevices());
            yield put(storeAllDevices(devicesWithOrg));

            const { data: allDevicesWithReads }: { data: DeviceDTO[] } = yield apply(
                deviceClient,
                deviceClient.getAll,
                [true]
            );
            yield put(addReadsAllDevices(allDevicesWithReads));
        } catch (error) {
            showNotification(i18n.t('device.feedback.errorGettingDevices'), NotificationType.Error);
            console.log(error);
        }
    }
}

function* fetchAndFormatMyDevices(): SagaIterator {
    while (true) {
        yield take(DevicesActions.FETCH_MY_DEVICES);

        const deviceClient: DeviceClient = yield select(getDeviceClient);
        const backendClient: BackendClient = yield select(getBackendClient);
        const organizationClient: OrganizationClient = backendClient.organizationClient;
        const i18n = getI18n();

        try {
            const { data: myDevices }: { data: DeviceDTO[] } = yield apply(
                deviceClient,
                deviceClient.getMyDevices,
                null
            );

            let ownOrgName = '';
            if (myDevices.length > 0) {
                const {
                    data: { name }
                } = yield apply(organizationClient, organizationClient.getPublic, [
                    myDevices[0].organizationId
                ]);
                ownOrgName = name;
            }

            const devicesWithOrg: IOriginDevice[] = myDevices.map((device) => ({
                ...device,
                organizationName: ownOrgName,
                locationText: getDeviceLocationText(device)
            }));

            yield put(clearMyDevices());
            yield put(storeMyDevices(devicesWithOrg));

            const { data: myDevicesWithReads }: { data: DeviceDTO[] } = yield apply(
                deviceClient,
                deviceClient.getMyDevices,
                [true]
            );
            yield put(addReadsMyDevices(myDevicesWithReads));
        } catch (error) {
            showNotification(i18n.t('device.feedback.errorGettingDevices'), NotificationType.Error);
            console.log(error);
        }
    }
}

function* createNewDevice(): SagaIterator {
    while (true) {
        const { payload: newDevice }: ICreateDeviceAction = yield take(
            DevicesActions.CREATE_DEVICE
        );

        yield put(setLoading(true));
        const baseUrl = getBaseURL();
        const i18n = getI18n();

        const deviceClient: DeviceClient = yield select(getDeviceClient);

        try {
            yield apply(deviceClient, deviceClient.createDevice, [newDevice]);

            yield put(fetchMyDevices());
            yield put(push(getDevicesOwnedLink(baseUrl)));

            showNotification(
                i18n.t('device.feedback.successCreatingDevice'),
                NotificationType.Success
            );
        } catch (error) {
            showNotification(i18n.t('device.feedback.errorCreatingDevice'), NotificationType.Error);
            console.log(error);
        }
        yield put(setLoading(false));
    }
}

function* approveSubmittedDevice(): SagaIterator {
    while (true) {
        const { payload: id }: IApproveDeviceAction = yield take(DevicesActions.APPROVE_DEVICE);

        yield put(setLoading(true));
        const deviceClient: DeviceClient = yield select(getDeviceClient);
        const i18n = getI18n();

        try {
            yield apply(deviceClient, deviceClient.updateDeviceStatus, [
                id.toString(),
                { status: DeviceStatus.Active }
            ]);

            yield put(fetchAllDevices());

            showNotification(
                i18n.t('device.feedback.successApprovingDevice'),
                NotificationType.Success
            );
        } catch (error) {
            showNotification(
                i18n.t('device.feedback.errorApprovingDevice'),
                NotificationType.Error
            );
            console.log(error);
        }

        yield put(setLoading(false));
    }
}

export function* devicesSaga(): SagaIterator {
    yield all([
        fork(fetchAndFormatAllDevices),
        fork(fetchAndFormatMyDevices),
        fork(createNewDevice),
        fork(approveSubmittedDevice)
    ]);
}
