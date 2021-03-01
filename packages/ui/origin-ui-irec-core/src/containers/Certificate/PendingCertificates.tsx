import React from 'react';
import { useSelector } from 'react-redux';
import { Role, isRole } from '@energyweb/origin-backend-core';
import { usePermissions, getUserOffchain, Requirements } from '@energyweb/origin-ui-core';
import { CertificationRequestsTable } from '../../components/certificates/table';

export function PendingCertificates() {
    const user = useSelector(getUserOffchain);
    const isIssuer = isRole(user, Role.Issuer);
    const { canAccessPage } = usePermissions();

    if (!canAccessPage?.value && !isIssuer) {
        return <Requirements />;
    }

    return <CertificationRequestsTable approved={false} />;
}
