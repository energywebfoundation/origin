import React from 'react';
import { useSelector } from 'react-redux';

import { getUserOffchain, getIsLeadUser } from '../../features/users/selectors';
import { OrganizationInvitationTable } from './OrganizationInvitationTable';

export function OrganizationInvitations() {
    const userOffchain = useSelector(getUserOffchain);
    const isLeadUser = useSelector(getIsLeadUser);

    return (
        <>
            {isLeadUser && (
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
