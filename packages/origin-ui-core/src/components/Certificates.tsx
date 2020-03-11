import React from 'react';
import { Route, NavLink, Redirect } from 'react-router-dom';
import { Role } from '@energyweb/user-registry';
import { PageContent } from './PageContent/PageContent';
import { CertificateTable, SelectedState } from './CertificateTable';
import { CertificateDetailView } from './CertificateDetailView';
import { CertificationRequestsTable } from './CertificationRequestsTable';
import { useLinks } from '../utils/routing';
import { useSelector } from 'react-redux';
import { getCurrentUser } from '../features/users/selectors';
import { useTranslation } from 'react-i18next';

export function Certificates() {
    const currentUser = useSelector(getCurrentUser);
    const { baseURL, getCertificatesLink } = useLinks();
    const { t } = useTranslation();

    function CertificateDetailViewId(id: string) {
        return <CertificateDetailView id={id} />;
    }

    function InboxCertificates() {
        return <CertificateTable selectedState={SelectedState.Inbox} />;
    }

    function ClaimedCertificates() {
        return <CertificateTable selectedState={SelectedState.Claimed} />;
    }

    const PendingCertificationRequestsTable = () => <CertificationRequestsTable approved={false} />;

    const ApprovedCertificationRequestsTable = () => <CertificationRequestsTable approved={true} />;

    const isIssuer = currentUser && currentUser.isRole(Role.Issuer);

    const CertificatesMenu = [
        {
            key: 'inbox',
            label: 'navigation.certificates.inbox',
            component: InboxCertificates,
            show: !isIssuer
        },
        {
            key: 'claims_report',
            label: 'navigation.certificates.claimsReport',
            component: ClaimedCertificates,
            show: !isIssuer
        },
        {
            key: 'detail_view',
            label: 'navigation.certificates.detailView',
            component: null,
            show: !isIssuer
        },
        {
            key: 'pending',
            label: 'navigation.certificates.pending',
            component: PendingCertificationRequestsTable,
            show: true
        },
        {
            key: 'approved',
            label: 'navigation.certificates.approved',
            component: ApprovedCertificationRequestsTable,
            show: isIssuer
        }
    ];

    const defaultRedirect = {
        pathname: `${getCertificatesLink()}/${
            isIssuer ? CertificatesMenu[4].key : CertificatesMenu[0].key
        }`
    };

    return (
        <div className="PageWrapper">
            <div className="PageNav">
                <ul className="NavMenu nav">
                    {CertificatesMenu.map(menu => {
                        if (menu.show) {
                            const link = `${getCertificatesLink()}/${menu.key}`;

                            return (
                                <li key={menu.key}>
                                    <NavLink to={link}>{t(menu.label)}</NavLink>
                                </li>
                            );
                        }
                    })}
                </ul>
            </div>

            <Route
                path={`${getCertificatesLink()}/:key/:id?`}
                render={props => {
                    const key = props.match.params.key;
                    const id = props.match.params.id;
                    const matches = CertificatesMenu.filter(item => {
                        return item.key === key;
                    });
                    if (matches.length > 0) {
                        if (key === 'detail_view') {
                            matches[0].component = () => CertificateDetailViewId(id);
                        }
                    }

                    return (
                        <PageContent
                            menu={matches.length > 0 ? matches[0] : null}
                            redirectPath={getCertificatesLink()}
                        />
                    );
                }}
            />

            <Route
                exact={true}
                path={getCertificatesLink()}
                render={() => <Redirect to={defaultRedirect} />}
            />

            <Route
                exact={true}
                path={`${baseURL}/`}
                render={() => <Redirect to={defaultRedirect} />}
            />
        </div>
    );
}
