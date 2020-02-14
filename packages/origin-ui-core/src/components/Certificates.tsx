import React from 'react';
import { Route, NavLink, Redirect } from 'react-router-dom';
import { Role } from '@energyweb/user-registry';
import { Demand } from '@energyweb/market';
import { PageContent } from './PageContent/PageContent';
import { CertificateTable, SelectedState } from './CertificateTable';
import { CertificateDetailView } from './CertificateDetailView';
import { CertificationRequestsTable } from './CertificationRequestsTable';
import { useLinks } from '../utils/routing';
import { useSelector } from 'react-redux';
import { getDemands } from '../features/selectors';
import { getCurrentUser } from '../features/users/selectors';
import { CertificationRequestStatus } from '@energyweb/origin-backend-core';

export function Certificates() {
    const demands = useSelector(getDemands);
    const currentUser = useSelector(getCurrentUser);
    const { baseURL, getCertificatesLink } = useLinks();

    function CertificateTableKeyDemand(key: SelectedState, demandId?: number) {
        let demand: Demand.Entity = null;
        if (demandId !== undefined) {
            demand = demands.find(d => d.id === demandId);
        }

        return <CertificateTable selectedState={key} demand={demand} />;
    }

    function CertificateDetailViewId(id: string) {
        return <CertificateDetailView id={id} />;
    }

    function InboxCertificates() {
        return CertificateTableKeyDemand(SelectedState.Inbox);
    }

    function ForSaleCertificates() {
        return CertificateTableKeyDemand(SelectedState.ForSale);
    }

    function ClaimedCertificates() {
        return CertificateTableKeyDemand(SelectedState.Claimed);
    }

    function ForDemandCertificates(demandId: number) {
        return CertificateTableKeyDemand(SelectedState.ForDemand, demandId);
    }

    const PendingCertificationRequestsTable = () => (
        <CertificationRequestsTable status={CertificationRequestStatus.Pending} />
    );

    const ApprovedCertificationRequestsTable = () => (
        <CertificationRequestsTable status={CertificationRequestStatus.Approved} />
    );

    const isIssuer = currentUser && currentUser.isRole(Role.Issuer);

    const CertificatesMenu = [
        {
            key: 'inbox',
            label: 'Inbox',
            component: InboxCertificates,
            show: !isIssuer
        },
        {
            key: 'for_sale',
            label: 'For sale',
            component: ForSaleCertificates,
            show: !isIssuer
        },
        {
            key: 'claims_report',
            label: 'Claims report',
            component: ClaimedCertificates,
            show: !isIssuer
        },
        {
            key: 'detail_view',
            label: 'Detail view',
            component: null,
            show: !isIssuer
        },
        {
            key: 'pending',
            label: 'Pending',
            component: PendingCertificationRequestsTable,
            show: true
        },
        {
            key: 'approved',
            label: 'Approved',
            component: ApprovedCertificationRequestsTable,
            show: isIssuer
        },
        {
            key: 'for_demand',
            label: 'For demand',
            component: null,
            show: false
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
                                    <NavLink to={link}>{menu.label}</NavLink>
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
                        } else if (key === 'for_demand') {
                            matches[0].component = () =>
                                ForDemandCertificates(id ? parseInt(id, 10) : id);
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
