import { SagaIterator } from 'redux-saga';
import { put, select, all, fork, call, cancelled, take } from 'redux-saga/effects';
import axios, { Canceler } from 'axios';
import { OffChainDataSource } from '@energyweb/origin-backend-client';
import { ExchangeClient } from '../../utils/exchange';
import {
    setExchangeClient,
    setEnvironment,
    IEnvironment,
    ExchangeGeneralActionType
} from './actions';
import { getEnvironment } from './selectors';

function prepareGetEnvironmentTask(): {
    getEnvironment: () => Promise<IEnvironment>;
    cancel: Canceler;
} {
    const source = axios.CancelToken.source();

    return {
        getEnvironment: async () => {
            try {
                const response = await axios.get('env-config.js', {
                    cancelToken: source.token
                });

                return response.data;
            } catch (error) {
                if (!axios.isCancel(error)) {
                    console.warn('Error while fetching env-config.js', error?.message ?? error);
                }
            }

            return {
                MODE: 'development',
                BACKEND_URL: 'http://localhost',
                BACKEND_PORT: '3030',
                BLOCKCHAIN_EXPLORER_URL: 'https://volta-explorer.energyweb.org',
                WEB3: 'http://localhost:8545',
                REGISTRATION_MESSAGE_TO_SIGN: 'I register as Origin user'
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

function* initializeExchangeApp(): SagaIterator {
    while (true) {
        yield take(ExchangeGeneralActionType.SET_ENVIRONMENT);

        const environment: IEnvironment = yield select(getEnvironment);

        const newOffChainDataSource = new OffChainDataSource(
            environment.BACKEND_URL,
            Number(environment.BACKEND_PORT)
        );

        const token = localStorage.getItem('AUTHENTICATION_TOKEN');
        newOffChainDataSource.requestClient.authenticationToken = token;

        yield put(
            setExchangeClient({
                exchangeClient: new ExchangeClient(
                    newOffChainDataSource.dataApiUrl,
                    newOffChainDataSource.requestClient
                )
            })
        );
    }
}

export function* exchangeGeneralSaga(): SagaIterator {
    yield all([fork(initializeExchangeApp), fork(setupEnvironment)]);
}
