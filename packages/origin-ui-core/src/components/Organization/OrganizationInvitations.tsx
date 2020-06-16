import React from 'react';
import { useSelector } from 'react-redux';

import { getUserOffchain } from '../../features/users/selectors';
import { OrganizationInvitationTable } from './OrganizationInvitationTable';
import { isRole, Role } from '@energyweb/origin-backend-core';
import { useTranslation } from '../../utils';

export function OrganizationInvitations() {
    const { t } = useTranslation();
    const userOffchain = useSelector(getUserOffchain);

    if (!userOffchain) {
        return t('general.feedback.registerOrLoginTryAgain');
    }

    return (
        <>
            {isRole(userOffchain, Role.OrganizationAdmin) && (
                <>
                    Sent
                    <br />
                    <br />
                    <OrganizationInvitationTable organizationId={userOffchain?.organization?.id} />
                    <br />
                    <br />
                </>
            )}
            Received
            <br />
            <br />
            <OrganizationInvitationTable email={userOffchain?.email} />
        </>
    );
}
