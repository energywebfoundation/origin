import axios, { Canceler } from 'axios';
import { SagaIterator } from 'redux-saga';
import { put, select, all, fork, call, cancelled, take } from 'redux-saga/effects';
import { UsersActions, IEnvironment } from '@energyweb/origin-ui-core';
import { setEnvironment, DeviceGeneralActions, setDeviceClient } from './actions';
import { getEnvironment } from './selectors';
import { DeviceClient } from '../../utils/client';

function prepareGetEnvironmentTask(): {
    getEnvironment: () => Promise<IEnvironment>;
    cancel: Canceler;
} {
    const source = axios.CancelToken.source();

    return {
        getEnvironment: async () => {
            try {
                const response = await axios.get('env-config.json', {
                    cancelToken: source.token
                });

                return response.data;
            } catch (error) {
                if (!axios.isCancel(error)) {
                    console.warn('Error while fetching env-config.json', error?.message ?? error);
                }
            }

            return {
                MODE: 'development',
                BACKEND_URL: 'http://localhost',
                BACKEND_PORT: '3030',
                BLOCKCHAIN_EXPLORER_URL: 'https://volta-explorer.energyweb.org',
                WEB3: 'http://localhost:8545',
                REGISTRATION_MESSAGE_TO_SIGN: 'I register as Origin user',
                MARKET_UTC_OFFSET: 0
            };
        },
        cancel: source.cancel
    };
}

function* setupEnvironment(): SagaIterator {
    let getEnvironmentTask: ReturnType<typeof prepareGetEnvironmentTask>;

    try {
        getEnvironmentTask = yield call(prepareGetEnvironmentTask);

        const environment: IEnvironment = yield call(getEnvironmentTask.getEnvironment);

        yield put(setEnvironment(environment));
    } finally {
        if (yield cancelled()) {
            getEnvironmentTask.cancel();
        }
    }
}

function* initializeDeviceClient(): SagaIterator {
    while (true) {
        yield take([DeviceGeneralActions.SET_ENVIRONMENT, UsersActions.clearAuthenticationToken]);

        const environment: IEnvironment = yield select(getEnvironment);

        const token = localStorage.getItem('AUTHENTICATION_TOKEN');
        const backendUrl = `${environment.BACKEND_URL}:${environment.BACKEND_PORT}`;

        yield put(
            setDeviceClient({
                deviceClient: new DeviceClient(backendUrl, token)
            })
        );
    }
}

function* initializeDeviceApp(): SagaIterator {
    while (true) {
        yield take(DeviceGeneralActions.INITIALIZE_DEVICE_APP);
        yield call(setupEnvironment);
    }
}

export function* iRecGeneralSaga(): SagaIterator {
    yield all([fork(setupEnvironment), fork(initializeDeviceApp), fork(initializeDeviceClient)]);
}
