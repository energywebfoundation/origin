import { call, put, select, take, fork, all } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import {
    UsersActions,
    ISetAuthenticationTokenAction,
    setUserOffchain,
    setAuthenticationToken,
    clearAuthenticationToken,
    IRefreshUserOffchainAction
} from './actions';
import { getOffChainDataSource } from '../general/selectors';
import { IRequestClient, IOffChainDataSource } from '@energyweb/origin-backend-client';
import {
    IUserWithRelationsIds,
    IOrganizationWithRelationsIds
} from '@energyweb/origin-backend-core';
import { GeneralActions, ISetOffChainDataSourceAction } from '../general/actions';

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
            const userProfile: IUserWithRelationsIds = yield call([userClient, userClient.me]);

            let organization: IOrganizationWithRelationsIds = null;

            if (typeof userProfile.organization !== 'undefined') {
                const organizationClient = offChainDataSource.organizationClient;

                organization = yield call(
                    [organizationClient, organizationClient.getById],
                    userProfile.organization
                );
            }

            yield put(
                setUserOffchain({
                    ...userProfile,
                    organization
                })
            );
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
