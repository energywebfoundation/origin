import React from 'react';
import { useSelector } from 'react-redux';
import { isRole, Role } from '@energyweb/origin-backend-core';
import { getUserOffchain, usePermissions, Requirements } from '@energyweb/origin-ui-core';
import { CertificateTable, SelectedState } from '../../components/certificates/table';

export function ClaimedCertificates() {
    const user = useSelector(getUserOffchain);
    const isIssuer = isRole(user, Role.Issuer);
    const { canAccessPage } = usePermissions();

    if (!canAccessPage?.value && !isIssuer) {
        return <Requirements />;
    }

    return <CertificateTable selectedState={SelectedState.Claimed} hiddenColumns={['source']} />;
}
