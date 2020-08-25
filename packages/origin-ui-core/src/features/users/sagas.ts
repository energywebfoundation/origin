import { call, put, select, take, fork, all } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import {
    UsersActions,
    ISetAuthenticationTokenAction,
    setUserOffchain,
    setAuthenticationToken,
    clearAuthenticationToken,
    IRefreshUserOffchainAction,
    setInvitations
} from './actions';
import { getOffChainDataSource } from '../general/selectors';
import {
    IOffChainDataSource,
    IRequestClient,
    IUser,
    IOrganizationInvitation
} from '@energyweb/origin-backend-core';
import { GeneralActions, ISetOffChainDataSourceAction } from '../general/actions';
import { reloadCertificates, clearCertificates } from '../certificates';
import { clearBundles } from '../bundles';
import { clearOrders } from '../orders/actions';

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

        if (
            !authenticationToken ||
            !offChainDataSource ||
            !offChainDataSource.requestClient.authenticationToken
        ) {
            continue;
        }

        try {
            const userProfile: IUser = yield call([userClient, userClient.me]);

            yield put(
                setUserOffchain({
                    ...userProfile
                })
            );
            const { organizationClient } = yield select(getOffChainDataSource);
            const invitations: IOrganizationInvitation[] = yield call(
                [organizationClient, organizationClient.getInvitations],
                null
            );
            yield put(
                setInvitations(
                    invitations.map((inv) => ({
                        ...inv,
                        createdAt: new Date(inv.createdAt)
                    }))
                )
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

        const requestClient: IRequestClient = (yield select(getOffChainDataSource)).requestClient;

        if (!requestClient) {
            return;
        }

        requestClient.authenticationToken = null;

        yield put(setUserOffchain(null));
        yield put(clearCertificates());
        yield put(clearBundles());
        yield put(clearOrders());
    }
}

export function* usersSaga(): SagaIterator {
    yield all([
        fork(setPreviouslyLoggedInOffchainUser),
        fork(persistAuthenticationToken),
        fork(fetchOffchainUserDetails),
        fork(logOutSaga)
    ]);
}
