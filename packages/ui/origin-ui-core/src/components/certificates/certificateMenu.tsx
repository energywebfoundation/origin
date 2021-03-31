import React from 'react';
import { useSelector } from 'react-redux';
import { isRole, UserStatus, Role } from '@energyweb/origin-backend-core';
import { OriginFeature } from '@energyweb/utils-general';
import { fromUsersSelectors } from '../../features';
import { CertificatesInbox } from './CertificatesInbox';
import { ClaimedCertificates } from './ClaimedCertificates';
import { PendingCertificates } from './PendingCertificates';
import { ApprovedCertificates } from './ApprovedCertificates';
import { CertificateImport } from './Import/CertificateImport';
import { ExchangeInboxPage } from './ExchangeInboxPage';
import { BlockchainInboxPage } from './BlockchainInboxPage';
import { RequestsPage } from './RequestsPage';

interface ICertificateMenuItem {
    key: string;
    label: string;
    component: React.ElementType;
    show: boolean;
    features: OriginFeature[];
}

export const useCertificatesMenu = (): ICertificateMenuItem[] => {
    const user = useSelector(fromUsersSelectors.getUserOffchain);
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
            component: CertificatesInbox,
            show: userIsActiveAndPartOfOrg,
            features: [OriginFeature.Certificates, OriginFeature.Buyer]
        },
        {
            key: 'exchange_inbox',
            label: 'navigation.certificates.exchangeInbox',
            component: ExchangeInboxPage,
            show: userIsActiveAndPartOfOrg,
            features: [OriginFeature.Certificates, OriginFeature.Buyer, OriginFeature.NewInboxes]
        },
        {
            key: 'blockchain-inbox',
            label: 'navigation.certificates.blockchainInbox',
            component: BlockchainInboxPage,
            show: userIsActiveAndPartOfOrg,
            features: [OriginFeature.Certificates, OriginFeature.Buyer, OriginFeature.NewInboxes]
        },
        {
            key: 'claims_report',
            label: 'navigation.certificates.claimsReport',
            component: ClaimedCertificates,
            show: userIsActiveAndPartOfOrg && !isIssuer,
            features: [OriginFeature.Certificates, OriginFeature.Buyer]
        },
        {
            key: 'requests',
            label: 'navigation.certificates.requests',
            component: RequestsPage,
            show: userIsActiveAndPartOfOrg && !isIssuer,
            features: [OriginFeature.Certificates, OriginFeature.Buyer]
        },
        {
            key: 'pending',
            label: 'navigation.certificates.pending',
            component: PendingCertificates,
            show: userIsActive && isIssuer,
            features: [OriginFeature.Certificates, OriginFeature.CertificationRequests]
        },
        {
            key: 'approved',
            label: 'navigation.certificates.approved',
            component: ApprovedCertificates,
            show: userIsActive && isIssuer,
            features: [OriginFeature.Certificates, OriginFeature.CertificationRequests]
        },
        {
            key: 'import',
            label: 'navigation.certificates.import',
            component: CertificateImport,
            show: (userIsActive && isIssuer) || userIsActiveAndPartOfOrg,
            features: [
                OriginFeature.Certificates,
                OriginFeature.CertificationRequests,
                OriginFeature.CertificatesImport
            ]
        },
        {
            key: 'detail_view',
            label: 'navigation.certificates.detailView',
            component: null,
            show: false,
            features: [OriginFeature.Certificates]
        }
    ];
};
