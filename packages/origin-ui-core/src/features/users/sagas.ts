import { call, put, select, take, fork, all, takeLatest } from 'redux-saga/effects';
import { Configuration } from '@energyweb/utils-general';
import { SagaIterator } from 'redux-saga';
import {
    UsersActions,
    IRequestUserAction,
    addUser,
    requestUser,
    IUpdateCurrentUserIdAction,
    IUserFetcher,
    ISetAuthenticationTokenAction,
    setUserOffchain,
    setAuthenticationToken,
    clearAuthenticationToken,
    IRefreshUserOffchainAction
} from './actions';
import { getConfiguration } from '../selectors';
import { getUserById, getUsers, getUserFetcher } from './selectors';
import { getRequestClient, getUserClient, getOrganizationClient } from '../general/selectors';
import { MarketUser } from '@energyweb/market';
import { IRequestClient, IUserClient, IOrganizationClient } from '@energyweb/origin-backend-client';
import { GeneralActions, ISetUserClientAction } from '../general/actions';
import { showNotification, NotificationType } from '../../utils';
import {
    IUserWithRelationsIds,
    IOrganizationWithRelationsIds
} from '@energyweb/origin-backend-core';

const LOCAL_STORAGE_KEYS = {
    AUTHENTICATION_TOKEN: 'AUTHENTICATION_TOKEN'
};

function getStoredAuthenticationToken() {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.AUTHENTICATION_TOKEN);
}

function* fetchUserSaga(userId: string, usersBeingFetched: any): SagaIterator {
    const users: MarketUser.Entity[] = yield select(getUsers);

    const existingUser: MarketUser.Entity = yield call(getUserById, users, userId);

    if (existingUser || usersBeingFetched.has(userId)) {
        return;
    }

    usersBeingFetched.set(userId, true);

    const configuration: Configuration.Entity = yield select(getConfiguration);
    const fetcher: IUserFetcher = yield select(getUserFetcher);

    try {
        const fetchedUser: MarketUser.Entity = yield call(fetcher.fetch, userId, configuration);

        if (fetchedUser) {
            yield put(addUser(fetchedUser));
        }
    } catch (error) {
        console.warn('Error while fetching user', error);
    }

    usersBeingFetched.delete(userId);
}

function* requestUserSaga(): SagaIterator {
    const usersBeingFetched = new Map<string, boolean>();

    while (true) {
        const action: IRequestUserAction = yield take(UsersActions.requestUser);

        if (!action.payload) {
            return;
        }

        const userId = action.payload.toLowerCase();

        try {
            yield fork(fetchUserSaga, userId, usersBeingFetched);
        } catch (error) {
            console.error('requestUserSaga: error', error);
        }
    }
}

function* requestCurrentUserDetailsSaga(action: IUpdateCurrentUserIdAction): SagaIterator {
    const users: MarketUser.Entity[] = yield select(getUsers);

    const userId = action.payload.toLowerCase();

    const existingUser: MarketUser.Entity = yield call(getUserById, users, userId);

    if (existingUser) {
        return;
    }

    yield put(requestUser(userId));
}

function* setPreviouslyLoggedInOffchainUser(): SagaIterator {
    const authenticationTokenFromStorage = getStoredAuthenticationToken();

    const requestClient: IRequestClient = yield select(getRequestClient);

    if (!authenticationTokenFromStorage || !requestClient) {
        return;
    }

    yield put(setAuthenticationToken(authenticationTokenFromStorage));

    requestClient.authenticationToken = authenticationTokenFromStorage;
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

        let userClient: IUserClient = yield select(getUserClient);

        if (!authenticationToken) {
            return;
        }

        if (!userClient) {
            const setUserClientAction: ISetUserClientAction = yield take(
                GeneralActions.setUserClient
            );

            userClient = setUserClientAction.payload;
        }

        try {
            const userProfile: IUserWithRelationsIds = yield call([userClient, userClient.me]);

            let organization: IOrganizationWithRelationsIds = null;

            if (typeof userProfile.organization !== 'undefined') {
                const organizationClient: IOrganizationClient = yield select(getOrganizationClient);

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

        const requestClient: IRequestClient = yield select(getRequestClient);

        if (!requestClient) {
            return;
        }

        requestClient.authenticationToken = null;

        yield put(setUserOffchain(null));

        showNotification('Logged out successfully.', NotificationType.Success);
    }
}

export function* usersSaga(): SagaIterator {
    yield all([
        fork(requestUserSaga),
        takeLatest([UsersActions.updateCurrentUserId], requestCurrentUserDetailsSaga),
        fork(setPreviouslyLoggedInOffchainUser),
        fork(persistAuthenticationToken),
        fork(fetchOffchainUserDetails),
        fork(logOutSaga)
    ]);
}
