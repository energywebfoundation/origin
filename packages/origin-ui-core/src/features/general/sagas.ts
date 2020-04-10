import { call, put, delay, select, take, all, fork, cancelled, apply } from 'redux-saga/effects';
import { Configuration } from '@energyweb/utils-general';
import { SagaIterator } from 'redux-saga';
import {
    hideAccountChangedModal,
    showAccountChangedModal,
    setEnvironment,
    IEnvironment,
    GeneralActions,
    setOffChainDataSource,
    setExchangeClient,
    setOffchainConfiguration
} from './actions';
import { getConfiguration } from '../selectors';
import {
    getAccountChangedModalVisible,
    getAccountChangedModalEnabled,
    getEnvironment,
    getOffChainDataSource
} from './selectors';
import { UsersActions } from '../users/actions';
import axios, { Canceler } from 'axios';
import { IOffChainDataSource, OffChainDataSource } from '@energyweb/origin-backend-client';
import { ExchangeClient } from '../../utils/exchange';
import { IOriginConfiguration } from '@energyweb/origin-backend-core';

function* showAccountChangedModalOnChange(): SagaIterator {
    while (true) {
        yield take(UsersActions.setActiveBlockchainAccountAddress);
        const conf: Configuration.Entity = yield select(getConfiguration);

        if (!conf) {
            return;
        }

        try {
            const initialAccounts: string[] = yield apply(
                conf.blockchainProperties.web3,
                conf.blockchainProperties.web3.listAccounts,
                []
            );

            while (true) {
                const accountChangedModalEnabled: boolean = yield select(
                    getAccountChangedModalEnabled
                );

                if (!accountChangedModalEnabled) {
                    break;
                }

                const accountChangedModalVisible: boolean = yield select(
                    getAccountChangedModalVisible
                );
                const accounts: string[] = yield apply(
                    conf.blockchainProperties.web3,
                    conf.blockchainProperties.web3.listAccounts,
                    []
                );

                if (accountChangedModalVisible) {
                    if (initialAccounts[0] === accounts[0]) {
                        yield put(hideAccountChangedModal());
                    }
                } else if (initialAccounts[0] !== accounts[0]) {
                    yield put(showAccountChangedModal());
                }

                yield delay(1000);
            }
        } catch (error) {
            console.error('showAccountChangedModalOnChange() error', error);
        }
    }
}

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

async function getConfigurationFromAPI(
    offChainDataSource: IOffChainDataSource
): Promise<IOriginConfiguration> {
    try {
        return await offChainDataSource.configurationClient.get();
    } catch {
        return null;
    }
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

function* fillOffchainConfiguration(): SagaIterator {
    while (true) {
        yield take([GeneralActions.setEnvironment, GeneralActions.setOffChainDataSource]);

        const environment: IEnvironment = yield select(getEnvironment);
        const offChainDataSource: IOffChainDataSource = yield select(getOffChainDataSource);

        if (!environment || !offChainDataSource) {
            continue;
        }

        const configuration: IOriginConfiguration = yield call(
            getConfigurationFromAPI,
            offChainDataSource
        );

        yield put(setOffchainConfiguration({ configuration }));
    }
}

function* initializeOffChainDataSource(): SagaIterator {
    while (true) {
        yield take(GeneralActions.setEnvironment);

        const environment: IEnvironment = yield select(getEnvironment);
        const offChainDataSource: IOffChainDataSource = yield select(getOffChainDataSource);

        if (!environment || offChainDataSource) {
            continue;
        }

        const newOffChainDataSource = new OffChainDataSource(
            environment.BACKEND_URL,
            Number(environment.BACKEND_PORT)
        );

        yield put(setOffChainDataSource(newOffChainDataSource));

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

export function* generalSaga(): SagaIterator {
    yield all([
        fork(showAccountChangedModalOnChange),
        fork(setupEnvironment),
        fork(initializeOffChainDataSource),
        fork(fillOffchainConfiguration)
    ]);
}
