import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { Skeleton } from '@material-ui/lab';
import { useValidation } from '../../utils';
import { ChangePasswordForm } from './userProfile';
import { UserDataEditForm } from './userProfile';
import { UserEmailChangeForm } from './userProfile';
import { BlockchainAddressesContainer } from './userProfile/BlockchainAddressesContainer';
import { fromUsersSelectors } from '../../features';

export const UserProfilePage = (): ReactElement => {
    const user = useSelector(fromUsersSelectors.getUserOffchain);
    const { yupLocaleInitialized } = useValidation();

    if (!yupLocaleInitialized) {
        return <Skeleton variant="rect" height={200} />;
    }

    if (!user) {
        return null;
    }

    return (
        <div id="user_profile">
            <UserDataEditForm />
            <br />
            <UserEmailChangeForm />
            <br />
            <ChangePasswordForm />
            <br />
            <BlockchainAddressesContainer />
        </div>
    );
};
