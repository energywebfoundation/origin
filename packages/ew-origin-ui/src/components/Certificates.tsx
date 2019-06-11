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
import { User } from 'ew-user-registry-lib';
import { Demand } from 'ew-market-lib';
import { Configuration } from 'ew-utils-general-lib';

import { PageContent } from '../elements/PageContent/PageContent';
import { CertificateTable, SelectedState } from './CertificateTable';
import { CertificateDetailView } from './CertificateDetailView';

export interface ICertificatesProps {
    conf: Configuration.Entity;
    certificates: Certificate.Entity[];
    producingAssets: ProducingAsset.Entity[];
    demands: Demand.Entity[];
    currentUser: User;
    baseUrl: string;
}

export interface ICertificatesState {
    switchedToOrganization: boolean;
}

export class Certificates extends React.Component<ICertificatesProps, ICertificatesState> {
    constructor(props: ICertificatesProps) {
        super(props);

        this.state = {
            switchedToOrganization: false
        };

        this.switchToOrganization = this.switchToOrganization.bind(this);
        this.onFilterOrganization = this.onFilterOrganization.bind(this);
        this.CertificateTable = this.CertificateTable.bind(this);
        this.InboxCertificates = this.InboxCertificates.bind(this);
        this.ForSaleCertificates = this.ForSaleCertificates.bind(this);
        this.ClaimedCertificates = this.ClaimedCertificates.bind(this);
        this.ForDemandCertificates = this.ForDemandCertificates.bind(this);
    }

    switchToOrganization(switchedToOrganization: boolean) {
        this.setState({
            switchedToOrganization
        });
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
                switchedToOrganization={this.state.switchedToOrganization}
                demand={demand}
            />
        );
    }

    onFilterOrganization(index: number) {
        this.setState({
            switchedToOrganization: index !== 0
        });
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

    render() {
        const allOrganizationsText = 'All Organizations';

        const organizations = this.props.currentUser
            ? [allOrganizationsText, this.props.currentUser.organization]
            : [allOrganizationsText];

        const CertificatesMenu = [
            {
                key: 'inbox',
                label: 'Inbox',
                component: this.InboxCertificates,
                buttons: [
                    {
                        type: 'dropdown',
                        label: allOrganizationsText,
                        face: ['filter', 'icon'],
                        content: organizations
                    }
                ],
                show: true
            },
            {
                key: 'for_sale',
                label: 'For Sale',
                component: this.ForSaleCertificates,
                buttons: [
                    {
                        type: 'dropdown',
                        label: allOrganizationsText,
                        face: ['filter', 'icon'],
                        content: organizations
                    }
                ],
                show: true
            },
            {
                key: 'claims_report',
                label: 'Claims Report',
                component: this.ClaimedCertificates,
                buttons: [
                    {
                        type: 'dropdown',
                        label: allOrganizationsText,
                        face: ['filter', 'icon'],
                        content: organizations
                    }
                ],
                show: true
            },
            {
                key: 'detail_view',
                label: 'Detail View',
                component: null,
                show: true
            },
            {
                key: 'for_demand',
                label: 'For Demand',
                component: null,
                show: false
            },
        ];

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
                                onFilterOrganization={this.onFilterOrganization}
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
                            to={{
                                pathname: `/${this.props.baseUrl}/certificates/${
                                    CertificatesMenu[0].key
                                }`
                            }}
                        />
                    )}
                />

                <Route
                    exact={true}
                    path={`/${this.props.baseUrl}/`}
                    render={props => (
                        <Redirect
                            to={{
                                pathname: `/${this.props.baseUrl}/certificates/${
                                    CertificatesMenu[0].key
                                }`
                            }}
                        />
                    )}
                />
            </div>
        );
    }
}
