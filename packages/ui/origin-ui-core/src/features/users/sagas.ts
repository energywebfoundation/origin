import {
    CertificatesClient,
    CertificationRequestsClient,
    Configuration as ClientConfiguration,
    BlockchainPropertiesClient
} from '@energyweb/issuer-api-client';
import { OriginFeature, signTypedMessage } from '@energyweb/utils-general';
import { UserClient } from '@energyweb/origin-backend-client';
import { UserStatus, OrganizationStatus } from '@energyweb/origin-backend-core';
import { call, put, select, take, fork, all, getContext, apply, delay } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import {
    UsersActions,
    ISetAuthenticationTokenAction,
    setUserOffchain,
    setAuthenticationToken,
    clearAuthenticationToken,
    setUserState,
    refreshUserOffchain,
    refreshClients,
    IUpdateUserBlockchainAction
} from './actions';
import {
    getBackendClient,
    getIRecClient,
    getEnvironment,
    getExchangeClient
} from '../general/selectors';
import { Registration } from '../../utils/irec/types';
import {
    GeneralActions,
    IEnvironment,
    setBackendClient,
    setExchangeClient,
    setIRecClient,
    setLoading
} from '../general/actions';
import {
    reloadCertificates,
    clearCertificates,
    setCertificatesClient,
    setCertificationRequestsClient,
    setBlockchainPropertiesClient
} from '../certificates';
import { getUserState, getUserOffchain } from './selectors';
import { IUsersState } from './reducer';

import { BackendClient } from '../../utils/clients/BackendClient';
import { ExchangeClient } from '../../utils/clients/ExchangeClient';
import { IRecClient } from '../../utils/clients/IRecClient';
import { showNotification, NotificationType } from '../..';
import { getI18n } from 'react-i18next';
import { getWeb3 } from '../selectors';

export const LOCAL_STORAGE_KEYS = {
    AUTHENTICATION_TOKEN: 'AUTHENTICATION_TOKEN'
};

function getStoredAuthenticationToken() {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.AUTHENTICATION_TOKEN);
}

function* setPreviouslyLoggedInOffchainUser(): SagaIterator {
    yield take(GeneralActions.setEnvironment);

    const authenticationTokenFromStorage = getStoredAuthenticationToken();

    const environment: IEnvironment = yield select(getEnvironment);

    if (!authenticationTokenFromStorage || !environment) {
        return;
    }

    yield put(setAuthenticationToken(authenticationTokenFromStorage));
}

function* persistAuthenticationToken(): SagaIterator {
    while (true) {
        const action: ISetAuthenticationTokenAction = yield take(
            UsersActions.setAuthenticationToken
        );

        if (typeof action.payload !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_KEYS.AUTHENTICATION_TOKEN, action.payload);
        }

        yield put(refreshClients());
    }
}

function* updateClients(): SagaIterator {
    while (true) {
        yield take(UsersActions.refreshClients);

        const environment: IEnvironment = yield select(getEnvironment);

        if (!environment) {
            continue;
        }

        const authenticationTokenFromStorage = getStoredAuthenticationToken();
        const backendUrl = `${environment.BACKEND_URL}:${environment.BACKEND_PORT}`;

        yield put(setBackendClient(new BackendClient(backendUrl, authenticationTokenFromStorage)));
        yield put(
            setExchangeClient(new ExchangeClient(backendUrl, authenticationTokenFromStorage))
        );
        yield put(setIRecClient(new IRecClient(backendUrl, authenticationTokenFromStorage)));

        const clientConfiguration = new ClientConfiguration(
            authenticationTokenFromStorage
                ? {
                      baseOptions: {
                          headers: {
                              Authorization: `Bearer ${authenticationTokenFromStorage}`
                          }
                      },
                      accessToken: authenticationTokenFromStorage
                  }
                : {}
        );

        yield put(
            setBlockchainPropertiesClient(
                new BlockchainPropertiesClient(clientConfiguration, backendUrl)
            )
        );
        yield put(setCertificatesClient(new CertificatesClient(clientConfiguration, backendUrl)));
        yield put(
            setCertificationRequestsClient(
                new CertificationRequestsClient(clientConfiguration, backendUrl)
            )
        );

        yield put(refreshUserOffchain());
    }
}

function* fetchOffchainUserDetails(): SagaIterator {
    while (true) {
        yield take(UsersActions.refreshUserOffchain);

        const { accountClient }: ExchangeClient = yield select(getExchangeClient);
        const backendClient: BackendClient = yield select(getBackendClient);
        const features = yield getContext('enabledFeatures');

        if (!backendClient?.accessToken) {
            continue;
        }

        const userClient: UserClient = backendClient.userClient;

        try {
            const { data: userOffchain } = yield call([userClient, userClient.me]);

            const { invitationClient } = backendClient;
            const { data: invitations } = yield call(
                [invitationClient, invitationClient.getInvitations],
                []
            );
            const userState: IUsersState = yield select(getUserState);

            const { data: account } = yield apply(accountClient, accountClient.getAccount, []);
            const exchangeDepositAddress = account.address;

            let iRecAccount: Registration[];

            if (features.includes(OriginFeature.IRec)) {
                const { organizationClient } = yield select(getIRecClient);
                const iRecAccountResponse = userOffchain.organization
                    ? yield call([organizationClient, organizationClient.getRegistrations], [])
                    : { data: [] };
                iRecAccount = iRecAccountResponse.data;
            }

            yield put(
                setUserState({
                    ...userState,
                    userOffchain,
                    iRecAccount,
                    exchangeDepositAddress,
                    invitations: {
                        ...userState.invitations,
                        invitations: invitations.map((inv) => ({
                            ...inv,
                            createdAt: new Date(inv.createdAt)
                        }))
                    }
                })
            );

            yield put(reloadCertificates());
        } catch (error) {
            console.log('error', error, error.response);

            if (error?.response?.status === 401) {
                yield put(clearAuthenticationToken());
            } else {
                console.warn('unkown error while getting user profile');
            }
        }
    }
}

function* updateBlockchainAddress(): SagaIterator {
    while (true) {
        const { payload }: IUpdateUserBlockchainAction = yield take(
            UsersActions.updateUserBlockchain
        );
        const { user, activeAccount, callback } = payload;

        yield put(setLoading(true));

        const web3 = yield select(getWeb3);
        const environment = yield select(getEnvironment);
        const backendClient: BackendClient = yield select(getBackendClient);
        const userClient: UserClient = backendClient.userClient;
        const i18n = getI18n();

        try {
            if (activeAccount === null) {
                throw Error(i18n.t('user.profile.noBlockchainConnection'));
            } else if (user?.blockchainAccountAddress === activeAccount.toLowerCase()) {
                throw Error(i18n.t('user.feedback.thisAccountAlreadyConnected'));
            }

            const message = yield call(
                signTypedMessage,
                activeAccount,
                environment.REGISTRATION_MESSAGE_TO_SIGN,
                web3
            );

            yield apply(userClient, userClient.updateOwnBlockchainAddress, [
                { signedMessage: message }
            ]);

            showNotification(
                i18n.t('settings.feedback.blockchainAccountLinked'),
                NotificationType.Success
            );
            yield put(refreshUserOffchain());
            yield call(callback);
        } catch (error) {
            if (error?.data?.message) {
                showNotification(error.data.message, NotificationType.Error);
            } else if (error?.response) {
                showNotification(error.response.data.message, NotificationType.Error);
            } else if (error?.message) {
                showNotification(error.message, NotificationType.Error);
            } else {
                console.warn('Could not log in.', error);
                showNotification(i18n.t('general.feedback.unknownError'), NotificationType.Error);
            }
        }
        yield put(setLoading(false));
    }
}

function* createUserExchangeAddress(): SagaIterator {
    while (true) {
        yield take(UsersActions.createExchangeDepositAddress);

        yield put(setLoading(true));
        const user = yield select(getUserOffchain);
        const { accountClient }: ExchangeClient = yield select(getExchangeClient);
        const i18n = getI18n();

        try {
            if (user.status !== UserStatus.Active) {
                throw Error(i18n.t('user.feedback.onlyActiveUsersCan'));
            } else if (
                !user.organization ||
                user.organization.status !== OrganizationStatus.Active
            ) {
                throw Error(i18n.t('user.feedback.onlyMembersOfActiveOrgCan'));
            }

            yield apply(accountClient, accountClient.create, []);
            yield delay(4000);
            showNotification(
                i18n.t('user.feedback.exchangeAddressSuccess'),
                NotificationType.Success
            );
            yield put(refreshUserOffchain());
        } catch (error) {
            if (error?.message) {
                showNotification(error?.message, NotificationType.Error);
            } else {
                console.warn('Could not create exchange deposit address.', error);
                showNotification(
                    i18n.t('user.feedback.exchangeAddressFailure'),
                    NotificationType.Error
                );
            }
        }
        yield put(setLoading(false));
    }
}

function* logOutSaga(): SagaIterator {
    while (true) {
        yield take(UsersActions.clearAuthenticationToken);

        localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTHENTICATION_TOKEN);

        yield put(refreshClients());
        yield put(setUserOffchain(null));
        yield put(clearCertificates());
    }
}

export function* usersSaga(): SagaIterator {
    yield all([
        fork(setPreviouslyLoggedInOffchainUser),
        fork(persistAuthenticationToken),
        fork(updateClients),
        fork(fetchOffchainUserDetails),
        fork(updateBlockchainAddress),
        fork(createUserExchangeAddress),
        fork(logOutSaga)
    ]);
}
