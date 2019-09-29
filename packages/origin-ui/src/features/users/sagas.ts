import { call, put, select, take, fork, all, takeLatest } from 'redux-saga/effects';
import { Configuration } from '@energyweb/utils-general';
import { SagaIterator } from 'redux-saga';
import {
    UsersActions,
    IRequestUserAction,
    addUser,
    requestUser,
    IUpdateCurrentUserIdAction
} from './actions';
import { getConfiguration } from '../selectors';
import { getUserById, getUsers } from './selectors';
import { User } from '@energyweb/user-registry';
import { IStoreState } from '../../types';

async function fetchUser(
    id: string,
    configuration: IStoreState['configuration']
): Promise<User.Entity> {
    return new User.Entity(id, configuration).sync();
}

function* fetchUserSaga(userId: string, usersBeingFetched: any): SagaIterator {
    const users: User.Entity[] = yield select(getUsers);

    const existingUser: User.Entity = yield call(getUserById, users, userId);

    if (existingUser || usersBeingFetched.has(userId)) {
        return;
    }

    usersBeingFetched.set(userId, true);

    const configuration: Configuration.Entity = yield select(getConfiguration);

    try {
        const fetchedUser: User.Entity = yield call(fetchUser, userId, configuration);

        yield put(addUser(fetchedUser));
    } catch (error) {
        console.error('Error while fetching user', error);
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

        yield fork(fetchUserSaga, userId, usersBeingFetched);
    }
}

function* requestCurrentUserDetailsSaga(action: IUpdateCurrentUserIdAction): SagaIterator {
    const users: User.Entity[] = yield select(getUsers);

    const userId = action.payload.toLowerCase();

    const existingUser: User.Entity = yield call(getUserById, users, userId);

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
