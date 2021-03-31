import React from 'react';
import { useSelector } from 'react-redux';
import { Role, isRole } from '@energyweb/origin-backend-core';
import { usePermissions } from '../../utils/permissions';
import { fromUsersSelectors } from '../../features/users';
import { Requirements } from '../Layout';
import { CertificationRequestsTable } from './CertificateTables';

export function ApprovedCertificates() {
    const user = useSelector(fromUsersSelectors.getUserOffchain);
    const isIssuer = isRole(user, Role.Issuer);
    const { canAccessPage } = usePermissions();

    if (!canAccessPage?.value && !isIssuer) {
        return <Requirements />;
    }

    return <CertificationRequestsTable approved={true} />;
}
