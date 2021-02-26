import React from 'react';
import { usePermissions } from '../../utils/permissions';
import { Requirements } from '../Layout';
import { CertificateTable, SelectedState } from './CertificateTables';

export function CertificatesInbox() {
    const { canAccessPage } = usePermissions();

    if (!canAccessPage?.value) {
        return <Requirements />;
    }

    return <CertificateTable selectedState={SelectedState.Inbox} />;
}
