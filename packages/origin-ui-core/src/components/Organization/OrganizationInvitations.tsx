import React from 'react';
import { useSelector } from 'react-redux';

import { getUserOffchain } from '../../features/users/selectors';
import { OrganizationInvitationTable } from './OrganizationInvitationTable';
import { isRole, Role } from '@energyweb/origin-backend-core';

export function OrganizationInvitations() {
    const user = useSelector(getUserOffchain);

    const orgId = user.organization?.id;

    return (
        <>
            {isRole(user, Role.OrganizationAdmin) && orgId && (
                <>
                    Sent
                    <br />
                    <br />
                    <OrganizationInvitationTable organizationId={orgId} />
                    <br />
                    <br />
                </>
            )}
            Received
            <br />
            <br />
            <OrganizationInvitationTable email={user?.email} />
        </>
    );
}
