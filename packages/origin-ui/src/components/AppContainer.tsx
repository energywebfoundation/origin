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
import { getBaseURL } from '../features/selectors';
import { getAssetsLink, getCertificatesLink, getAdminLink, getDemandsLink } from '../utils/routing';
import { getError, getLoading } from '../features/general/selectors';

interface IMatchParams {
    contractAddress?: string;
}

interface IStateProps {
    baseURL: string;
    error: string;
    loading: boolean;
}

interface IDispatchProps {
    setOriginContractLookupAddress: TSetOriginContractLookupAddress;
}

type Props = RouteComponentProps<IMatchParams> & IStateProps & IDispatchProps;

class AppContainerClass extends React.Component<Props> {
    async componentDidMount(): Promise<void> {
        const contractAddress = this.props.match.params.contractAddress;

        this.props.setOriginContractLookupAddress(contractAddress);
    }

    render(): JSX.Element {
        const { baseURL, error, loading } = this.props;

        if (error) {
            return <ErrorComponent message={error} />;
        }

        if (loading) {
            return <LoadingComponent />;
        }

        return (
            <div className={`AppWrapper`}>
                <Header />
                <Switch>
                    <Route path={getAssetsLink(baseURL)} component={Asset} />
                    <Route path={getCertificatesLink(baseURL)} component={Certificates} />
                    <Route path={getAdminLink(baseURL)} component={Admin} />
                    <Route path={getDemandsLink(baseURL)} component={Demands} />

                    <Route path={baseURL} component={Asset} />
                </Switch>
                <AccountChangedModal />
            </div>
        );
    }
}

export const AppContainer = withRouter(
    connect(
        (state: IStoreState): IStateProps => ({
            baseURL: getBaseURL(state),
            error: getError(state),
            loading: getLoading(state)
        }),
        dispatch =>
            bindActionCreators(
                {
                    setOriginContractLookupAddress
                },
                dispatch
            )
    )(AppContainerClass)
);
