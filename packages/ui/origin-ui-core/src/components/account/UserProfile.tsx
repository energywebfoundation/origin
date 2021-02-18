import React from 'react';
import { useSelector } from 'react-redux';
import { Skeleton } from '@material-ui/lab';
import { getUserOffchain } from '../../features/users';
import { useValidation } from '../../utils/validation';
import { ChangePasswordForm } from './UserProfile/ChangePassword';
import { BlockchainAddresses } from './UserProfile/BlockchainAddresses';
import { UserDataEditForm } from './UserProfile/UserDataEditForm';
import { UserEmailChange } from './UserProfile/UserEmailChange';

export function UserProfile(): JSX.Element {
    const user = useSelector(getUserOffchain);
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
            <UserEmailChange />
            <br />
            <ChangePasswordForm />
            <br />
            <BlockchainAddresses />
        </div>
    );
}
