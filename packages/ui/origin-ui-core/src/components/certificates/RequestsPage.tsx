import React from 'react';
import { useSelector } from 'react-redux';
import { isRole, Role } from '@energyweb/origin-backend-core';
import { usePermissions } from '../../utils';
import { Requirements } from '../Layout';
import { CertificationRequestsTable } from './CertificateTables';
import { fromUsersSelectors } from '../../features';

export function RequestsPage(): JSX.Element {
    const user = useSelector(fromUsersSelectors.getUserOffchain);
    const isIssuer = isRole(user, Role.Issuer);
    const { canAccessPage } = usePermissions();

    if (!canAccessPage.value && !isIssuer) {
        return <Requirements />;
    }

    return <CertificationRequestsTable />;
}
