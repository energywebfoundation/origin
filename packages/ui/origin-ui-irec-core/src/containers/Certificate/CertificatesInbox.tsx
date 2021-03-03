import React from 'react';
import { usePermissions, Requirements } from '@energyweb/origin-ui-core';
import { CertificateTable, SelectedState } from '../../components/certificates/table';

export function CertificatesInbox() {
    const { canAccessPage } = usePermissions();

    if (!canAccessPage?.value) {
        return <Requirements />;
    }

    return <CertificateTable selectedState={SelectedState.Inbox} />;
}
