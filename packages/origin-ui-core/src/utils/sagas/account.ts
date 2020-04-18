import {
    setAccountMismatchModalPropertiesAction,
    GeneralActions,
    IAccountMismatchModalResolvedAction
} from '../../features/general/actions';
import { getUserOffchain, getActiveBlockchainAccountAddress } from '../../features/users/selectors';

import { IUserWithRelations } from '@energyweb/origin-backend-core';
import { select, put, take } from 'redux-saga/effects';

export function* assertCorrectBlockchainAccount() {
    const user: IUserWithRelations = yield select(getUserOffchain);
    const activeBlockchainAddress: string = yield select(getActiveBlockchainAccountAddress);

    if (
        user &&
        user.blockchainAccountAddress &&
        user.blockchainAccountAddress.toLowerCase() === activeBlockchainAddress?.toLowerCase()
    ) {
        return true;
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
