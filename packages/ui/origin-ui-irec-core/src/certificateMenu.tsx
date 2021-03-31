import React from 'react';
import { useSelector } from 'react-redux';
import { isRole, UserStatus, Role } from '@energyweb/origin-backend-core';
import { OriginFeature } from '@energyweb/utils-general';
import { CertificatesInbox } from './containers/Certificate/CertificatesInbox';
import { ClaimedCertificates } from './containers/Certificate/ClaimedCertificates';
import { PendingCertificates } from './containers/Certificate/PendingCertificates';
import { ApprovedCertificates } from './containers/Certificate/ApprovedCertificates';
import { CertificateImport } from './containers/Certificate/CertificateImport';
import { ExchangeInboxPage } from './containers/Certificate/ExchangeInboxPage';
import { BlockchainInboxPage } from './containers/Certificate/BlockchainInboxPage';
import { fromUsersSelectors } from '@energyweb/origin-ui-core';

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
            features: [OriginFeature.Certificates, OriginFeature.Buyer]
        },
        {
            key: 'blockchain-inbox',
            label: 'navigation.certificates.blockchainInbox',
            component: BlockchainInboxPage,
            show: userIsActiveAndPartOfOrg,
            features: [OriginFeature.Certificates, OriginFeature.Buyer]
        },
        {
            key: 'claims_report',
            label: 'navigation.certificates.claimsReport',
            component: ClaimedCertificates,
            show: userIsActiveAndPartOfOrg && !isIssuer,
            features: [OriginFeature.Certificates, OriginFeature.Buyer]
        },
        {
            key: 'pending',
            label: 'navigation.certificates.pending',
            component: PendingCertificates,
            show: (userIsActive && isIssuer) || userIsActiveAndPartOfOrg,
            features: [OriginFeature.Certificates, OriginFeature.CertificationRequests]
        },
        {
            key: 'approved',
            label: 'navigation.certificates.approved',
            component: ApprovedCertificates,
            show: (userIsActive && isIssuer) || userIsActiveAndPartOfOrg,
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
