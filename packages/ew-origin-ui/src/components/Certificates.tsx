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
import * as OriginIssuer from 'ew-origin-lib';
import * as EwAsset from 'ew-asset-registry-lib';
import * as EwUser from 'ew-user-registry-lib';
import * as General from 'ew-utils-general-lib';
import { OrganizationFilter } from './OrganizationFilter';

import { Table } from '../elements/Table/Table';
import TableUtils from '../elements/utils/TableUtils';
import FadeIn from 'react-fade-in';
import { Nav, NavItem } from 'react-bootstrap';
import { BrowserRouter, Route, Link, NavLink, Redirect } from 'react-router-dom';
import { PageContent } from '../elements/PageContent/PageContent';
import { CertificateTable, SelectedState } from './CertificateTable';
import { CertificateDetailView } from './CertificateDetailView';

export interface CertificatesProps {
    conf: General.Configuration.Entity;
    certificates: OriginIssuer.Certificate.Entity[];
    producingAssets: EwAsset.ProducingAsset.Entity[];
    currentUser: EwUser.User;
    baseUrl: string;

}

export interface CertificatesState {

    switchedToOrganization: boolean;

}

export class Certificates extends React.Component<CertificatesProps, CertificatesState> {

    constructor(props: CertificatesProps) {
        super(props);

        this.state = {

            switchedToOrganization: false
        };

        this.switchToOrganization = this.switchToOrganization.bind(this);
        this.onFilterOrganization = this.onFilterOrganization.bind(this);
        this.CertificateTable = this.CertificateTable.bind(this);
        this.SoldCertificates = this.SoldCertificates.bind(this);
        this.ForSaleCertificates = this.ForSaleCertificates.bind(this);
        this.ClaimedCertificates = this.ClaimedCertificates.bind(this);

    }

    switchToOrganization(switchedToOrganization: boolean) {
        this.setState({
            switchedToOrganization: switchedToOrganization
        });
    }

    CertificateTable(key) {
        return <CertificateTable
            conf={this.props.conf}
            certificates={this.props.certificates}
            producingAssets={this.props.producingAssets}
            currentUser={this.props.currentUser}
            baseUrl={this.props.baseUrl}
            selectedState={key}
            switchedToOrganization={this.state.switchedToOrganization}
        />;

    }

    onFilterOrganization(index: number) {
        this.setState({
            switchedToOrganization: index !== 0
        });
    }

    CertificateDetailView(id: number) {
        return <CertificateDetailView
            id={id} baseUrl={this.props.baseUrl}
            producingAssets={this.props.producingAssets}
            conf={this.props.conf}
            certificates={this.props.certificates}
        />;
    }

    SoldCertificates() {
        return this.CertificateTable(SelectedState.Sold);
    }

    ForSaleCertificates() {
        return this.CertificateTable(SelectedState.ForSale);

    }

    ClaimedCertificates() {
        return this.CertificateTable(SelectedState.Claimed);

    }

    render() {

        const organizations = this.props.currentUser ?
            ['All Organizations', this.props.currentUser.organization] :
            ['All Organizations'];

        const CertificatesMenu = [
            {
                key: 'claims_report',
                label: 'Claims Report',
                component: this.ClaimedCertificates,
                buttons: [
                    {
                        type: 'dropdown',
                        label: 'All Organizations',
                        face: ['filter', 'icon'],
                        content: organizations
                    }
                ]
            }, {
                key: 'for_sale',
                label: 'For Sale',
                component: this.ForSaleCertificates,
                buttons: [
                    {
                        type: 'dropdown',
                        label: 'All Organizations',
                        face: ['filter', 'icon'],
                        content: organizations
                    }
                ]
            }, {
                key: 'bought_sold',
                label: 'Bought / Sold',
                component: this.SoldCertificates,
                buttons: [
                    {
                        type: 'dropdown',
                        label: 'All Organizations',
                        face: ['filter', 'icon'],
                        content: organizations
                    }
                ]
            }, {
                key: 'detail_view',
                label: 'Detail View',
                component: null
            }
        ];

        return <div className='PageWrapper'>
            <div className='PageNav'>
                <Nav className='NavMenu'>
                    {
                        CertificatesMenu.map((menu) => {

                            return (<li key={menu.key}><NavLink to={`/${this.props.baseUrl}/certificates/${menu.key}`} activeClassName='active'>{menu.label}</NavLink></li>);
                        })

                    }
                </Nav>
            </div>

            <Route path={'/' + this.props.baseUrl + '/certificates/:key/:id?'} render={props => {
                const key = props.match.params.key;
                const id = props.match.params.id;
                const matches = CertificatesMenu.filter(item => {
                    return item.key === key;
                });
                if (matches.length > 0 && key === 'detail_view') {
                    matches[0].component = () => this.CertificateDetailView(id ? parseInt(id, 10) : id);
                }
                return (<PageContent onFilterOrganization={this.onFilterOrganization} menu={matches.length > 0 ? matches[0] : null} redirectPath={'/' + this.props.baseUrl + '/certificates'} />);
            }} />
            <Route exact path={'/' + this.props.baseUrl + '/certificates'} render={props => (<Redirect to={{ pathname: `/${this.props.baseUrl}/certificates/${CertificatesMenu[0].key}` }} />)} />
            <Route exact path={'/' + this.props.baseUrl + '/'} render={props => (<Redirect to={{ pathname: `/${this.props.baseUrl}/certificates/${CertificatesMenu[0].key}` }} />)} />

        </div>;

    }

}
