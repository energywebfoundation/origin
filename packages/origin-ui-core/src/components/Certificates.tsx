import React from 'react';
import { Route, NavLink, Redirect } from 'react-router-dom';
import { Role, isRole } from '@energyweb/origin-backend-core';
import { PageContent } from './PageContent/PageContent';
import { CertificateTable, SelectedState } from './CertificateTable';
import { CertificateDetailView } from './CertificateDetailView';
import { CertificationRequestsTable } from './CertificationRequestsTable';
import { useSelector } from 'react-redux';
import { getUserOffchain } from '../features/users/selectors';
import { getCurrencies } from '../features/general/selectors';
import { useTranslation } from 'react-i18next';
import { Exchange } from './exchange';
import { useLinks } from '../utils';

function CertificateDetailViewId(id: number) {
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

export function Certificates() {
    const currencies = useSelector(getCurrencies);
    const user = useSelector(getUserOffchain);

    const { baseURL, getCertificatesLink } = useLinks();
    const { t } = useTranslation();

    const ExchangeRoute = () => <Exchange currency={(currencies && currencies[0]) ?? 'USD'} />;

    const isIssuer = isRole(user, Role.Issuer);

    const CertificatesMenu = [
        {
            key: 'inbox',
            label: 'navigation.certificates.inbox',
            component: InboxCertificates,
            show: user && !isIssuer
        },
        {
            key: 'claims_report',
            label: 'navigation.certificates.claimsReport',
            component: ClaimedCertificates,
            show: user && !isIssuer
        },
        {
            key: 'detail_view',
            label: 'navigation.certificates.detailView',
            component: null,
            show: false
        },
        {
            key: 'pending',
            label: 'navigation.certificates.pending',
            component: PendingCertificationRequestsTable,
            show: user
        },
        {
            key: 'approved',
            label: 'navigation.certificates.approved',
            component: ApprovedCertificationRequestsTable,
            show: isIssuer
        },
        {
            key: 'exchange',
            label: 'navigation.certificates.exchange',
            component: ExchangeRoute,
            show: true
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
                    {CertificatesMenu.map((menu) => {
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
                render={(props) => {
                    const key = props.match.params.key;
                    const id = props.match.params.id;
                    const matches = CertificatesMenu.filter((item) => {
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
