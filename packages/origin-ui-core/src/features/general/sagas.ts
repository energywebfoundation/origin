import { call, put, delay, select, take, all, fork } from 'redux-saga/effects';
import { Configuration } from '@energyweb/utils-general';
import { SagaIterator } from 'redux-saga';
import {
    hideAccountChangedModal,
    showAccountChangedModal,
    setEnvironment,
    IEnvironment,
    GeneralActions,
    setCurrencies,
    setCompliance,
    setCountry,
    setRegions,
    setOrganizationClient,
    setUserClient
} from './actions';
import { getConfiguration } from '../selectors';
import {
    getAccountChangedModalVisible,
    getAccountChangedModalEnabled,
    getEnvironment,
    getConfigurationClient,
    getRequestClient,
    getUserClient
} from './selectors';
import { UsersActions } from '../users/actions';
import { isUsingInBrowserPK } from '../authentication/selectors';
import axios from 'axios';
import {
    IConfigurationClient,
    OrganizationClient,
    UserClient,
    IRequestClient,
    IUserClient
} from '@energyweb/origin-backend-client';

function* showAccountChangedModalOnChange(): SagaIterator {
    while (true) {
        yield take(UsersActions.updateCurrentUserId);
        const conf: Configuration.Entity = yield select(getConfiguration);

        if (!conf) {
            return;
        }

        try {
            const initialAccounts: string[] = yield call(
                conf.blockchainProperties.web3.eth.getAccounts
            );

            while (true) {
                const accountChangedModalEnabled: boolean = yield select(
                    getAccountChangedModalEnabled
                );
                const usingInBrowserPrivateKey: boolean = yield select(isUsingInBrowserPK);

                if (!accountChangedModalEnabled || usingInBrowserPrivateKey) {
                    break;
                }

                const accountChangedModalVisible: boolean = yield select(
                    getAccountChangedModalVisible
                );
                const accounts: string[] = yield call(
                    conf.blockchainProperties.web3.eth.getAccounts
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

async function getENV(): Promise<IEnvironment> {
    try {
        const response = await axios.get('env-config.js');

        return response.data;
    } catch (error) {
        console.warn('Error while fetching env-config.js');
    }

    return {
        MODE: 'development',
        BACKEND_URL: 'http://localhost:3030',
        BLOCKCHAIN_EXPLORER_URL: 'https://volta-explorer.energyweb.org',
        WEB3: 'http://localhost:8545',
        REGISTRATION_MESSAGE_TO_SIGN: 'I register as Origin user'
    };
}

async function getComplianceFromAPI(configurationClient: IConfigurationClient, baseURL: string) {
    try {
        return configurationClient.get(baseURL, 'Compliance');
    } catch {
        return null;
    }
}

async function getCurrenciesFromAPI(configurationClient: IConfigurationClient, baseURL: string) {
    try {
        const currencies = await configurationClient.get(baseURL, 'Currency');

        if (currencies.length > 0) {
            return currencies;
        }

        return null;
    } catch {
        return null;
    }
}

async function getCountryFromAPI(configurationClient: IConfigurationClient, baseURL: string) {
    try {
        return configurationClient.get(baseURL, 'Country');
    } catch {
        return null;
    }
}

function* setupEnvironment(): SagaIterator {
    const environment: IEnvironment = yield call(getENV);

    yield put(setEnvironment(environment));
}

function* fillCurrency(): SagaIterator {
    while (true) {
        yield take(GeneralActions.setEnvironment);

        const environment: IEnvironment = yield select(getEnvironment);

        if (!environment) {
            return;
        }

        const baseURL = `${environment.BACKEND_URL}/api`;

        const configurationClient: IConfigurationClient = yield select(getConfigurationClient);

        const currencies = yield call(getCurrenciesFromAPI, configurationClient, baseURL);

        yield put(
            setCurrencies({
                currencies
            })
        );
    }
}

function* fillCompliance(): SagaIterator {
    while (true) {
        yield take(GeneralActions.setEnvironment);

        const environment: IEnvironment = yield select(getEnvironment);

        if (!environment) {
            return;
        }

        const baseURL = `${environment.BACKEND_URL}/api`;

        const configurationClient: IConfigurationClient = yield select(getConfigurationClient);

        try {
            const compliance = yield call(getComplianceFromAPI, configurationClient, baseURL);

            yield put(setCompliance(compliance));
        } catch (error) {
            console.warn('Could not set compliance due to an error: ', error?.message);
        }
    }
}

function* fillCountryAndRegions(): SagaIterator {
    while (true) {
        yield take(GeneralActions.setEnvironment);

        const environment: IEnvironment = yield select(getEnvironment);

        if (!environment) {
            return;
        }

        const baseURL = `${environment.BACKEND_URL}/api`;

        const configurationClient: IConfigurationClient = yield select(getConfigurationClient);

        try {
            const country = yield call(getCountryFromAPI, configurationClient, baseURL);

            yield put(setCountry(country ? country.name : null));
            yield put(setRegions(country ? country.regions : null));
        } catch (error) {
            console.warn(`Could not set country and regions due to an error: `, error?.message);
        }
    }
}

function* initializeOrganizationClient(): SagaIterator {
    while (true) {
        yield take(GeneralActions.setEnvironment);

        const environment: IEnvironment = yield select(getEnvironment);
        const requestClient: IRequestClient = yield select(getRequestClient);
        const existingOrganizationClient: IUserClient = yield select(getUserClient);

        if (!environment || !requestClient || existingOrganizationClient) {
            return;
        }

        const baseURL = `${environment.BACKEND_URL}/api`;

        const organizationClient = new OrganizationClient(baseURL, requestClient);

        yield put(setOrganizationClient(organizationClient));
    }
}

function* initializeUserClient(): SagaIterator {
    while (true) {
        yield take(GeneralActions.setEnvironment);

        const environment: IEnvironment = yield select(getEnvironment);
        const requestClient: IRequestClient = yield select(getRequestClient);
        const existingUserClient: IUserClient = yield select(getUserClient);

        if (!environment || !requestClient || existingUserClient) {
            return;
        }

        const baseURL = `${environment.BACKEND_URL}/api`;

        const userClient = new UserClient(baseURL, requestClient);

        yield put(setUserClient(userClient));
    }
}

export function* generalSaga(): SagaIterator {
    yield all([
        fork(showAccountChangedModalOnChange),
        fork(setupEnvironment),
        fork(fillCurrency),
        fork(fillCompliance),
        fork(fillCountryAndRegions),
        fork(initializeOrganizationClient),
        fork(initializeUserClient)
    ]);
}
