import React from 'react';
import { useSelector } from 'react-redux';
import { isRole, UserStatus, Role, IUser } from '@energyweb/origin-backend-core';
import { OriginFeature } from '@energyweb/utils-general';
import { CertificateTable, SelectedState } from './CertificateTable';
import { CertificationRequestsTable } from './CertificationRequestsTable';
import { usePermissions } from '../../utils';
import { Requirements } from '../Requirements';
import { getUserOffchain } from '../../features';
import { CertificateImport } from './Import/CertificateImport';
import { ExchangeInbox } from './CertificatesInbox';

interface ICertificateMenuItem {
    key: string;
    label: string;
    component: React.ReactType;
    show: boolean;
    features: OriginFeature[];
}

function InboxCertificates() {
    const { canAccessPage } = usePermissions();

    if (!canAccessPage?.value) {
        return <Requirements />;
    }

    return <CertificateTable selectedState={SelectedState.Inbox} />;
}

function ClaimedCertificates() {
    const { canAccessPage } = usePermissions();
    const user = useSelector(getUserOffchain);
    const isIssuer = isRole(user, Role.Issuer);

    if (!canAccessPage?.value && !isIssuer) {
        return <Requirements />;
    }

    return <CertificateTable selectedState={SelectedState.Claimed} hiddenColumns={['source']} />;
}

function PendingCertificationRequestsTable() {
    const { canAccessPage } = usePermissions();
    const user = useSelector(getUserOffchain);
    const isIssuer = isRole(user, Role.Issuer);

    if (!canAccessPage?.value && !isIssuer) {
        return <Requirements />;
    }

    return <CertificationRequestsTable approved={false} />;
}

function ApprovedCertificationRequestsTable() {
    const user = useSelector(getUserOffchain);
    const isIssuer = isRole(user, Role.Issuer);
    const { canAccessPage } = usePermissions();

    if (!canAccessPage?.value && !isIssuer) {
        return <Requirements />;
    }

    return <CertificationRequestsTable approved={true} />;
}

export const certificatesMenuCreator = (user: IUser): ICertificateMenuItem[] => {
    const isIssuer = isRole(user, Role.Issuer);
    const userIsActive = user && user.status === UserStatus.Active;
    const userIsActiveAndPartOfOrg =
        user?.organization &&
        userIsActive &&
        isRole(user, Role.OrganizationUser, Role.OrganizationDeviceManager, Role.OrganizationAdmin);

    return [
        {
            key: 'inbox',
            label: 'navigation.certificates.inbox',
            component: InboxCertificates,
            show: userIsActiveAndPartOfOrg,
            features: [OriginFeature.Certificates, OriginFeature.Buyer]
        },
        {
            key: 'Exchange-inbox',
            label: 'navigation.certificates.exchangeInbox',
            component: ExchangeInbox,
            show: userIsActiveAndPartOfOrg,
            features: [OriginFeature.Certificates, OriginFeature.Buyer]
        },
        {
            key: 'claims_report',
            label: 'navigation.certificates.claimsReport',
            component: ClaimedCertificates,
            show: isIssuer || userIsActiveAndPartOfOrg,
            features: [OriginFeature.Certificates, OriginFeature.Buyer]
        },
        {
            key: 'detail_view',
            label: 'navigation.certificates.detailView',
            component: null,
            show: false,
            features: [OriginFeature.Certificates]
        },
        {
            key: 'pending',
            label: 'navigation.certificates.pending',
            component: PendingCertificationRequestsTable,
            show: (userIsActive && isIssuer) || userIsActiveAndPartOfOrg,
            features: [OriginFeature.Certificates, OriginFeature.CertificationRequests]
        },
        {
            key: 'approved',
            label: 'navigation.certificates.approved',
            component: ApprovedCertificationRequestsTable,
            show: (userIsActive && isIssuer) || userIsActiveAndPartOfOrg,
            features: [OriginFeature.Certificates, OriginFeature.CertificationRequests]
        },
        {
            key: 'import',
            label: 'navigation.certificates.import',
            component: CertificateImport,
            show: true || (userIsActive && isIssuer) || userIsActiveAndPartOfOrg,
            features: [
                OriginFeature.Certificates,
                OriginFeature.CertificationRequests,
                OriginFeature.CertificatesImport
            ]
        }
    ];
};
