import React from 'react';
import { useSelector } from 'react-redux';
import { isRole, Role } from '@energyweb/origin-backend-core';
import { getUserOffchain } from '../../features/users';
import { usePermissions } from '../../utils/permissions';
import { Requirements } from '../Layout';
import { CertificateTable, SelectedState } from './CertificateTables';

export function ClaimedCertificates() {
    const user = useSelector(getUserOffchain);
    const isIssuer = isRole(user, Role.Issuer);
    const { canAccessPage } = usePermissions();

    if (!canAccessPage?.value && !isIssuer) {
        return <Requirements />;
    }

    return <CertificateTable selectedState={SelectedState.Claimed} hiddenColumns={['source']} />;
}
