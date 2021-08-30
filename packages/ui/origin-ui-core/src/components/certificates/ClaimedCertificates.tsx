import React from 'react';
import { useSelector } from 'react-redux';
import { isRole, Role } from '@energyweb/origin-backend-core';
import { usePermissions } from '../../utils/permissions';
import { Requirements } from '../Layout';
import { CertificateTable, SelectedState } from './CertificateTables';
import { fromUsersSelectors } from '../../features/users';

export function ClaimedCertificates() {
    const user = useSelector(fromUsersSelectors.getUserOffchain);
    const isIssuer = isRole(user, Role.Issuer);
    const { canAccessPage } = usePermissions();

    if (!canAccessPage?.value && !isIssuer) {
        return <Requirements />;
    }

    return <CertificateTable selectedState={SelectedState.Claimed} hiddenColumns={['source']} />;
}
