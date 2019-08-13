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
import { Nav } from 'react-bootstrap';

import { Certificate } from 'ew-origin-lib';
import { ProducingAsset } from 'ew-asset-registry-lib';
import { User, Role } from 'ew-user-registry-lib';
import { Demand } from 'ew-market-lib';
import { Configuration } from 'ew-utils-general-lib';

import { PageContent } from '../elements/PageContent/PageContent';
import { CertificateTable, SelectedState } from './CertificateTable';
import { CertificateDetailView } from './CertificateDetailView';
import { CertificationRequestsTable } from './CertificationRequestsTable';

export interface ICertificatesProps {
    conf: Configuration.Entity;
    certificates: Certificate.Entity[];
    producingAssets: ProducingAsset.Entity[];
    demands: Demand.Entity[];
    currentUser: User;
    baseUrl: string;
}

export class Certificates extends React.Component<ICertificatesProps> {
    constructor(props: ICertificatesProps) {
        super(props);

        this.CertificateTable = this.CertificateTable.bind(this);
        this.InboxCertificates = this.InboxCertificates.bind(this);
        this.ForSaleCertificates = this.ForSaleCertificates.bind(this);
        this.ClaimedCertificates = this.ClaimedCertificates.bind(this);
        this.ForDemandCertificates = this.ForDemandCertificates.bind(this);
        this.PendingCertificationRequests = this.PendingCertificationRequests.bind(this);
        this.ApprovedCertificationRequests = this.ApprovedCertificationRequests.bind(this);
    }

    CertificateTable(key: SelectedState, demandId?: number) {
        let demand: Demand.Entity = null;
        if (demandId !== undefined) {
            demand = this.props.demands.find((d: Demand.Entity) => d.id === demandId.toString());
        }

        return (
            <CertificateTable
                conf={this.props.conf}
                certificates={this.props.certificates}
                producingAssets={this.props.producingAssets}
                currentUser={this.props.currentUser}
                baseUrl={this.props.baseUrl}
                selectedState={key}
                demand={demand}
            />
        );
    }

    CertificateDetailView(id: number) {
        return (
            <CertificateDetailView
                id={id}
                baseUrl={this.props.baseUrl}
                producingAssets={this.props.producingAssets}
                conf={this.props.conf}
                certificates={this.props.certificates}
            />
        );
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

    PendingCertificationRequests() {
        return <CertificationRequestsTable
            conf={this.props.conf}
            producingAssets={this.props.producingAssets}
            currentUser={this.props.currentUser}
        />
    }

    ApprovedCertificationRequests() {
        return <CertificationRequestsTable
            conf={this.props.conf}
            producingAssets={this.props.producingAssets}
            currentUser={this.props.currentUser}
            approvedOnly={true}
        />
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
                component: this.PendingCertificationRequests,
                show: true
            },
            {
                key: 'approved',
                label: 'Approved',
                component: this.ApprovedCertificationRequests,
                show: isIssuer
            },
            {
                key: 'for_demand',
                label: 'For Demand',
                component: null,
                show: false
            },
        ];

        const defaultRedirect = {
            pathname: `/${this.props.baseUrl}/certificates/${
                isIssuer ? CertificatesMenu[4].key : CertificatesMenu[0].key
            }`
        };

        return (
            <div className="PageWrapper">
                <div className="PageNav">
                    <Nav className="NavMenu">
                        {CertificatesMenu.map(menu => {
                            if (menu.show) {
                                return (
                                    <li key={menu.key}>
                                        <NavLink
                                            to={`/${this.props.baseUrl}/certificates/${menu.key}`}
                                            activeClassName="active"
                                        >
                                            {menu.label}
                                        </NavLink>
                                    </li>
                                );
                            }
                        })}
                    </Nav>
                </div>

                <Route
                    path={`/${this.props.baseUrl}/certificates/:key/:id?`}
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
                                matches[0].component = () => this.ForDemandCertificates(id ? parseInt(id, 10) : id);
                            }

                        }

                        return (
                            <PageContent
                                menu={matches.length > 0 ? matches[0] : null}
                                redirectPath={`/${this.props.baseUrl}/certificates`}
                            />
                        );
                    }}
                />

                <Route
                    exact={true}
                    path={`/${this.props.baseUrl}/certificates`}
                    render={props => (
                        <Redirect
                            to={defaultRedirect}
                        />
                    )}
                />

                <Route
                    exact={true}
                    path={`/${this.props.baseUrl}/`}
                    render={props => (
                        <Redirect
                            to={defaultRedirect}
                        />
                    )}
                />
            </div>
        );
    }
}
