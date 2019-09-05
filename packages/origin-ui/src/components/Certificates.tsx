// Copyright 2018 Energy Web Foundation
// This file is part of the Origin Application brought to you by the Energy Web Foundation,
// a global non-profit organization focused on accelerating blockchain technology across the energy sector,
// incorporated in Zug, Switzerland.
//
// The Origin Application is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY and without an implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
//
// @authors: slock.it GmbH; Heiko Burkhardt, heiko.burkhardt@slock.it; Martin Kuechler, martin.kuchler@slock.it

import * as React from 'react';
import { Route, NavLink, Redirect } from 'react-router-dom';
import { User, Role } from '@energyweb/user-registry';
import { Demand } from '@energyweb/market';
import { PageContent } from '../elements/PageContent/PageContent';
import { CertificateTable, SelectedState } from './CertificateTable';
import { CertificateDetailView } from './CertificateDetailView';
import { CertificationRequestsTable } from './CertificationRequestsTable';
import { getCertificatesLink } from '../utils/routing';
import { connect } from 'react-redux';
import { IStoreState } from '../types';
import { getBaseURL, getCurrentUser, getDemands } from '../features/selectors';

interface IStateProps {
    demands: Demand.Entity[];
    currentUser: User.Entity;
    baseURL: string;
}

type Props = IStateProps;

class CertificatesClass extends React.Component<Props> {
    constructor(props: Props) {
        super(props);

        this.CertificateTable = this.CertificateTable.bind(this);
        this.InboxCertificates = this.InboxCertificates.bind(this);
        this.ForSaleCertificates = this.ForSaleCertificates.bind(this);
        this.ClaimedCertificates = this.ClaimedCertificates.bind(this);
        this.ForDemandCertificates = this.ForDemandCertificates.bind(this);
    }

    CertificateTable(key: SelectedState, demandId?: number) {
        let demand: Demand.Entity = null;
        if (demandId !== undefined) {
            demand = this.props.demands.find((d: Demand.Entity) => d.id === demandId.toString());
        }

        return <CertificateTable selectedState={key} demand={demand} />;
    }

    CertificateDetailView(id: number) {
        return <CertificateDetailView id={id} />;
    }

    InboxCertificates() {
        return this.CertificateTable(SelectedState.Inbox);
    }

    ForSaleCertificates() {
        return this.CertificateTable(SelectedState.ForSale);
    }

    ClaimedCertificates() {
        return this.CertificateTable(SelectedState.Claimed);
    }

    ForDemandCertificates(demandId: number) {
        return this.CertificateTable(SelectedState.ForDemand, demandId);
    }

    render() {
        const isIssuer = this.props.currentUser && this.props.currentUser.isRole(Role.Issuer);

        const CertificatesMenu = [
            {
                key: 'inbox',
                label: 'Inbox',
                component: this.InboxCertificates,
                show: !isIssuer
            },
            {
                key: 'for_sale',
                label: 'For Sale',
                component: this.ForSaleCertificates,
                show: !isIssuer
            },
            {
                key: 'claims_report',
                label: 'Claims Report',
                component: this.ClaimedCertificates,
                show: !isIssuer
            },
            {
                key: 'detail_view',
                label: 'Detail View',
                component: null,
                show: !isIssuer
            },
            {
                key: 'pending',
                label: 'Pending',
                component: CertificationRequestsTable,
                show: true
            },
            {
                key: 'approved',
                label: 'Approved',
                component: () => <CertificationRequestsTable approvedOnly={true} />,
                show: isIssuer
            },
            {
                key: 'for_demand',
                label: 'For Demand',
                component: null,
                show: false
            }
        ];

        const defaultRedirect = {
            pathname: `${getCertificatesLink(this.props.baseURL)}/${
                isIssuer ? CertificatesMenu[4].key : CertificatesMenu[0].key
            }`
        };

        return (
            <div className="PageWrapper">
                <div className="PageNav">
                    <ul className="NavMenu nav">
                        {CertificatesMenu.map(menu => {
                            if (menu.show) {
                                const link = `${getCertificatesLink(this.props.baseURL)}/${
                                    menu.key
                                }`;

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
                    path={`${getCertificatesLink(this.props.baseURL)}/:key/:id?`}
                    render={props => {
                        const key = props.match.params.key;
                        const id = props.match.params.id;
                        const matches = CertificatesMenu.filter(item => {
                            return item.key === key;
                        });
                        if (matches.length > 0) {
                            if (key === 'detail_view') {
                                matches[0].component = () =>
                                    this.CertificateDetailView(id ? parseInt(id, 10) : id);
                            } else if (key === 'for_demand') {
                                matches[0].component = () =>
                                    this.ForDemandCertificates(id ? parseInt(id, 10) : id);
                            }
                        }

                        return (
                            <PageContent
                                menu={matches.length > 0 ? matches[0] : null}
                                redirectPath={getCertificatesLink(this.props.baseURL)}
                            />
                        );
                    }}
                />

                <Route
                    exact={true}
                    path={getCertificatesLink(this.props.baseURL)}
                    render={() => <Redirect to={defaultRedirect} />}
                />

                <Route
                    exact={true}
                    path={`${this.props.baseURL}/`}
                    render={() => <Redirect to={defaultRedirect} />}
                />
            </div>
        );
    }
}

export const Certificates = connect(
    (state: IStoreState): IStateProps => ({
        baseURL: getBaseURL(state),
        currentUser: getCurrentUser(state),
        demands: getDemands(state)
    })
)(CertificatesClass);
