import React from 'react';
import { useSelector } from 'react-redux';
import { getUserOffchain } from '../../features/users';
import { isRole, Role } from '@energyweb/origin-backend-core';
import { usePermissions } from '../../utils';
import { Requirements } from '../Layout';
import { CertificationRequestsTable } from './CertificateTables';

export function CertificateRequestsTable(): JSX.Element {
    const user = useSelector(getUserOffchain);
    const isIssuer = isRole(user, Role.Issuer);
    const { canAccessPage } = usePermissions();

    if (!canAccessPage.value && !isIssuer) {
        return <Requirements />;
    }

    return <CertificationRequestsTable />;
}
