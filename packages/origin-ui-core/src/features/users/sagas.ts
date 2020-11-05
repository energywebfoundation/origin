import { OriginFeature } from '@energyweb/utils-general';
import { call, put, select, take, fork, all, getContext } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import {
    UsersActions,
    ISetAuthenticationTokenAction,
    setUserOffchain,
    setAuthenticationToken,
    clearAuthenticationToken,
    IRefreshUserOffchainAction,
    setUserState
} from './actions';
import { getOffChainDataSource, getIRecClient, getEnvironment } from '../general/selectors';
import {
    IOffChainDataSource,
    IRequestClient,
    IUser,
    IOrganizationInvitation
} from '@energyweb/origin-backend-core';
import { Registration } from '../../utils/irec/types';
import { GeneralActions, IEnvironment, ISetOffChainDataSourceAction } from '../general/actions';
import {
    reloadCertificates,
    clearCertificates,
    setCertificatesClient,
    setCertificationRequestsClient
} from '../certificates';
import { getUserState } from './selectors';
import { IUsersState } from './reducer';
import {
    CertificatesClient,
    CertificationRequestsClient,
    Configuration as ClientConfiguration
} from '@energyweb/issuer-api-client';

const LOCAL_STORAGE_KEYS = {
    AUTHENTICATION_TOKEN: 'AUTHENTICATION_TOKEN'
};

function getStoredAuthenticationToken() {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.AUTHENTICATION_TOKEN);
}

function* setPreviouslyLoggedInOffchainUser(): SagaIterator {
    const authenticationTokenFromStorage = getStoredAuthenticationToken();

    let offChainDataSource: IOffChainDataSource = yield select(getOffChainDataSource);

    if (!offChainDataSource) {
        const action: ISetOffChainDataSourceAction = yield take(
            GeneralActions.setOffChainDataSource
        );

        offChainDataSource = action.payload;
    }

    const requestClient: IRequestClient = offChainDataSource.requestClient;

    if (!authenticationTokenFromStorage || !requestClient) {
        return;
    }

    requestClient.authenticationToken = authenticationTokenFromStorage;

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
    }
}

function* updateClients(): SagaIterator {
    while (true) {
        const action: ISetAuthenticationTokenAction = yield take(
            UsersActions.setAuthenticationToken
        );

        const environment: IEnvironment = yield select(getEnvironment);

        const clientConfiguration = new ClientConfiguration({
            baseOptions: {
                headers: {
                    Authorization: `Bearer ${action.payload}`
                }
            },
            accessToken: action.payload
        });
        const backendUrl = `${environment.BACKEND_URL}:${environment.BACKEND_PORT}`;

        yield put(setCertificatesClient(new CertificatesClient(clientConfiguration, backendUrl)));
        yield put(
            setCertificationRequestsClient(
                new CertificationRequestsClient(clientConfiguration, backendUrl)
            )
        );
    }
}

function* fetchOffchainUserDetails(): SagaIterator {
    while (true) {
        const action: ISetAuthenticationTokenAction | IRefreshUserOffchainAction = yield take([
            UsersActions.setAuthenticationToken,
            UsersActions.refreshUserOffchain
        ]);

        const authenticationToken =
            action.type === UsersActions.setAuthenticationToken
                ? action.payload
                : getStoredAuthenticationToken();

        const offChainDataSource: IOffChainDataSource = yield select(getOffChainDataSource);
        const userClient = offChainDataSource.userClient;
        const features = yield getContext('enabledFeatures');

        if (
            !authenticationToken ||
            !offChainDataSource ||
            !offChainDataSource.requestClient.authenticationToken
        ) {
            continue;
        }

        try {
            const userOffchain: IUser = yield call([userClient, userClient.me]);

            const { invitationClient } = yield select(getOffChainDataSource);
            const invitations: IOrganizationInvitation[] = yield call(
                [invitationClient, invitationClient.getInvitations],
                null
            );
            const userState: IUsersState = yield select(getUserState);

            let iRecAccount: Registration[];

            if (features.includes(OriginFeature.IRec)) {
                const iRecClient = yield select(getIRecClient);
                iRecAccount = userOffchain.organization
                    ? yield call([iRecClient, iRecClient.getRegistrations], null)
                    : [];
            }

            yield put(
                setUserState({
                    ...userState,
                    userOffchain,
                    iRecAccount,
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

function* logOutSaga(): SagaIterator {
    while (true) {
        yield take(UsersActions.clearAuthenticationToken);

        localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTHENTICATION_TOKEN);

        const environment: IEnvironment = yield select(getEnvironment);
        const requestClient: IRequestClient = (yield select(getOffChainDataSource)).requestClient;

        if (!requestClient) {
            return;
        }

        requestClient.authenticationToken = null;

        const backendUrl = `${environment.BACKEND_URL}:${environment.BACKEND_PORT}`;
        yield put(
            setCertificatesClient(new CertificatesClient(new ClientConfiguration(), backendUrl))
        );
        yield put(
            setCertificationRequestsClient(
                new CertificationRequestsClient(new ClientConfiguration(), backendUrl)
            )
        );

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
        fork(logOutSaga)
    ]);
}
