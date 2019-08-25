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
import { ProducingAsset, ConsumingAsset } from '@energyweb/asset-registry';
import { Configuration } from '@energyweb/utils-general';
import { Demand } from '@energyweb/market';
import { Certificate } from '@energyweb/origin';
import { User } from '@energyweb/user-registry';
import { Certificates } from './Certificates';
import { Route, Switch, withRouter, RouteComponentProps } from 'react-router-dom';
import { IStoreState } from '../types';
import { Header } from './Header';
import { Asset } from './Asset';
import { Admin } from './Admin';
import './AppContainer.scss';
import { Demands } from './Demands';
import { AccountChangedModal } from '../elements/Modal/AccountChangedModal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ErrorComponent } from './ErrorComponent';
import { LoadingComponent } from './LoadingComponent';
import {
    TSetOriginContractLookupAddress,
    setOriginContractLookupAddress
} from '../features/contracts/actions';
import { getBaseURL, getConfiguration, getCurrentUser } from '../features/selectors';
import { getAssetsLink, getCertificatesLink, getAdminLink, getDemandsLink } from '../utils/routing';
import { getOriginContractLookupAddress } from '../features/contracts/selectors';
import { getError, getLoading } from '../features/general/selectors';

interface MatchParams {
    contractAddress?: string;
}

interface StateProps {
    baseURL: string;
    certificates: Certificate.Entity[];
    configuration: Configuration.Entity;
    consumingAssets: ConsumingAsset.Entity[];
    currentUser: User;
    demands: Demand.Entity[];
    error: string;
    loading: boolean;
    originContractLookupAddress: string;
    producingAssets: ProducingAsset.Entity[];
}

interface DispatchProps {
    setOriginContractLookupAddress: TSetOriginContractLookupAddress;
}

type Props = RouteComponentProps<MatchParams> & StateProps & DispatchProps;

class AppContainerClass extends React.Component<Props> {
    constructor(props: Props) {
        super(props);

        this.CertificateTable = this.CertificateTable.bind(this);
        this.DemandTable = this.DemandTable.bind(this);
        this.Admin = this.Admin.bind(this);
        this.Asset = this.Asset.bind(this);
    }

    async componentDidMount(): Promise<void> {
        let contractAddress = this.props.match.params.contractAddress;

        this.props.setOriginContractLookupAddress(contractAddress);
    }

    Asset() {
        return (
            <Asset
                certificates={this.props.certificates}
                producingAssets={this.props.producingAssets}
                demands={this.props.demands}
                consumingAssets={this.props.consumingAssets}
                conf={this.props.configuration}
                currentUser={this.props.currentUser}
                baseUrl={this.props.match.params.contractAddress}
            />
        );
    }

    CertificateTable() {
        return (
            <Certificates
                baseUrl={this.props.match.params.contractAddress}
                producingAssets={this.props.producingAssets}
                certificates={this.props.certificates}
                demands={this.props.demands}
                conf={this.props.configuration}
                currentUser={this.props.currentUser}
            />
        );
    }

    DemandTable() {
        return (
            <Demands
                conf={this.props.configuration}
                demands={this.props.demands}
                consumingAssets={this.props.consumingAssets}
                producingAssets={this.props.producingAssets}
                currentUser={this.props.currentUser}
                baseUrl={this.props.match.params.contractAddress}
            />
        );
    }

    Admin() {
        return (
            <Admin
                conf={this.props.configuration}
                currentUser={this.props.currentUser}
                producingAssets={this.props.producingAssets}
                baseUrl={this.props.match.params.contractAddress}
            />
        );
    }

    render(): JSX.Element {
        const { baseURL, configuration, error, loading } = this.props;

        if (error) {
            return <ErrorComponent message={error} />;
        }

        if (configuration === null || loading) {
            return <LoadingComponent />;
        }

        return (
            <div className={`AppWrapper`}>
                <Header />
                <Switch>
                    <Route path={getAssetsLink(baseURL)} component={this.Asset} />
                    <Route path={getCertificatesLink(baseURL)} component={this.CertificateTable} />
                    <Route path={getAdminLink(baseURL)} component={this.Admin} />
                    <Route path={getDemandsLink(baseURL)} component={this.DemandTable} />

                    <Route path={baseURL} component={this.Asset} />
                </Switch>
                <AccountChangedModal />
            </div>
        );
    }
}

export const AppContainer = connect(
    (state: IStoreState) => ({
        baseURL: getBaseURL(state),
        certificates: state.certificates,
        configuration: getConfiguration(state),
        consumingAssets: state.consumingAssets,
        currentUser: getCurrentUser(state),
        demands: state.demands,
        error: getError(state),
        loading: getLoading(state),
        originContractLookupAddress: getOriginContractLookupAddress(state),
        producingAssets: state.producingAssets
    }),
    dispatch =>
        bindActionCreators(
            {
                setOriginContractLookupAddress
            },
            dispatch
        )
)(withRouter(AppContainerClass));
