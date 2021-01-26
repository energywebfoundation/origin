import {
    setAccountMismatchModalPropertiesAction,
    GeneralActions,
    IAccountMismatchModalResolvedAction,
    setNoAccountModalVisibilityAction
} from '../../features/general/actions';
import { getUserOffchain, getActiveBlockchainAccountAddress } from '../../features/users/selectors';

import { IUser } from '@energyweb/origin-backend-core';
import { select, put, take } from 'redux-saga/effects';
import { getBlockchainAccount } from '../user';

export function* assertCorrectBlockchainAccount() {
    const user: IUser = yield select(getUserOffchain);
    const activeBlockchainAddress: string = yield select(getActiveBlockchainAccountAddress);

    if (user) {
        if (!getBlockchainAccount(user) || !activeBlockchainAddress) {
            yield put(setNoAccountModalVisibilityAction(true));

            return false;
        } else if (
            getBlockchainAccount(user)?.address.toLowerCase() ===
            activeBlockchainAddress?.toLowerCase()
        ) {
            return true;
        }
    }

    yield put(
        setAccountMismatchModalPropertiesAction({
            visibility: true
        })
    );
    const { payload: shouldContinue }: IAccountMismatchModalResolvedAction = yield take(
        GeneralActions.accountMismatchModalResolved
    );

    return shouldContinue;
}
