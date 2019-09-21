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
import { NavLink, withRouter, RouteComponentProps } from 'react-router-dom';
import { User } from '@energyweb/user-registry';
import logo from '../../assets/logo.svg';
import { AccountCircle } from '@material-ui/icons';
import { Configuration } from '@energyweb/utils-general';

import './Header.scss';
import { connect } from 'react-redux';
import { IStoreState } from '../types';
import { getBaseURL, getConfiguration } from '../features/selectors';
import { getAssetsLink, getCertificatesLink, getDemandsLink } from '../utils/routing';
import { AccountDetailsModal } from '../elements/Modal/AccountDetailsModal';
import { getCurrentUser } from '../features/users/selectors';

interface IStateProps {
    configuration: Configuration.Entity;
    currentUser: User.Entity;
    baseURL: string;
}

type Props = RouteComponentProps & IStateProps;

interface IHeaderState {
    showAccountDetailsModal: boolean;
}

class HeaderClass extends React.Component<Props, IHeaderState> {
    constructor(props: Props) {
        super(props);

        this.state = {
            showAccountDetailsModal: false
        };
    }

    render() {
        const { baseURL, currentUser, configuration } = this.props;

        return (
            <div className="HeaderWrapper">
                <div className="Header">
                    <NavLink to={getAssetsLink(baseURL)}>
                        <img src={logo} />
                    </NavLink>
                    <ul className="NavMenu nav">
                        <li>
                            <NavLink to={getAssetsLink(baseURL)}>Assets</NavLink>
                        </li>
                        <li>
                            <NavLink to={getCertificatesLink(baseURL)}>Certificates</NavLink>
                        </li>
                        <li>
                            <NavLink to={getDemandsLink(baseURL)}>Demands</NavLink>
                        </li>
                    </ul>

                    <div
                        className="ViewProfile"
                        onClick={() => this.setState({ showAccountDetailsModal: true })}
                    >
                        <AccountCircle className="ViewProfile_icon" color="primary" />
                        {currentUser ? currentUser.organization : 'Guest'}
                    </div>
                </div>

                {currentUser && (
                    <AccountDetailsModal
                        conf={configuration}
                        currentUser={currentUser}
                        showModal={this.state.showAccountDetailsModal}
                        callback={() => this.setState({ showAccountDetailsModal: false })}
                    />
                )}
            </div>
        );
    }
}

export const Header = withRouter(
    connect((state: IStoreState) => ({
        configuration: getConfiguration(state),
        baseURL: getBaseURL(state),
        currentUser: getCurrentUser(state)
    }))(HeaderClass)
);
