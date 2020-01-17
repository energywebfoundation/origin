import { call, put, select, take, fork, all, takeLatest } from 'redux-saga/effects';
import { Configuration } from '@energyweb/utils-general';
import { SagaIterator } from 'redux-saga';
import {
    UsersActions,
    IRequestUserAction,
    addUser,
    requestUser,
    IUpdateCurrentUserIdAction,
    IUserFetcher
} from './actions';
import { getConfiguration } from '../selectors';
import { getUserById, getUsers, getUserFetcher } from './selectors';
import { MarketUser } from '@energyweb/market';

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

export function* usersSaga(): SagaIterator {
    yield all([
        fork(requestUserSaga),
        takeLatest([UsersActions.updateCurrentUserId], requestCurrentUserDetailsSaga)
    ]);
}
