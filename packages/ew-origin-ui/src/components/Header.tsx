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
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

import { User } from 'ew-user-registry-lib';

import logo from '../../assets/logo.svg';

import { AccountCircle } from '@material-ui/icons';

import './Header.scss';

export interface IHeaderProps {
    currentUser: User;
    baseUrl: string;
}

export class Header extends React.Component<IHeaderProps, {}> {
    render() {
        const { baseUrl, currentUser } = this.props;

        return (
            <div className="HeaderWrapper">
                <div className="Header">
                    <NavLink to="/assets" activeClassName="active">
                        <img src={logo} />
                    </NavLink>
                    <Nav className="NavMenu">
                        <li>
                            <NavLink
                                to={`/${baseUrl}/assets`}
                                activeClassName="active"
                            >
                                Assets
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to={`/${baseUrl}/certificates`}
                                activeClassName="active"
                            >
                                Certificates
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to={`/${baseUrl}/demands`}
                                activeClassName="active"
                            >
                                Demands
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to={`/${baseUrl}/admin`}
                                activeClassName="active"
                            >
                                Admin
                            </NavLink>
                        </li>
                    </Nav>
                    <div className="ViewProfile">
                        <AccountCircle className="ViewProfile_icon" color="primary" />
                        {currentUser ? currentUser.organization : 'Guest'}
                    </div>
                </div>
            </div>
        );
    }
}
