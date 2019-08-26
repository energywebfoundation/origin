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
import { NavLink, Redirect, Route } from 'react-router-dom';
import { PageContent } from '../elements/PageContent/PageContent';
import { OnboardDemand } from './OnboardDemand';
import { getAdminLink } from '../utils/routing';
import { connect } from 'react-redux';
import { IStoreState } from '../types';
import { getBaseURL } from '../features/selectors';


interface IStateProps {
    baseURL: string;
}

class AdminClass extends React.Component<IStateProps> {
    render() {
        const AdminMenu = [
            {
                key: 'onboard_demand',
                label: 'Onboard demand',
                component: OnboardDemand
            },
            {
                key: 'onboard_user',
                label: 'Onboard user',
                component: null
            },
            {
                key: 'onborad_assets',
                label: 'Onboard assets',
                component: null
            }
        ];

        const baseURL = this.props.baseURL;

        return (
            <div className="PageWrapper">
                <div className="PageNav">
                    <ul className="NavMenu nav">
                        {AdminMenu.map(menu => {
                            return (
                                <li>
                                    <NavLink
                                        exact={true}
                                        to={`${getAdminLink(baseURL)}/${menu.key}`}
                                    >
                                        {menu.label}
                                    </NavLink>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <Route
                    path={`${getAdminLink(baseURL)}/:key`}
                    render={props => {
                        const key = props.match.params.key;
                        const matches = AdminMenu.filter(item => {
                            return item.key === key;
                        });

                        return (
                            <PageContent
                                menu={matches.length > 0 ? matches[0] : null}
                                redirectPath={getAdminLink(baseURL)}
                            />
                        );
                    }}
                />
                <Route
                    exact={true}
                    path={getAdminLink(baseURL)}
                    render={() => (
                        <Redirect to={{ pathname: `${getAdminLink(baseURL)}/${AdminMenu[0].key}` }} />
                    )}
                />
            </div>
        );
    }
}

export const Admin = connect(
    (state: IStoreState): IStateProps => ({
        baseURL: getBaseURL(state)
    })
)(AdminClass);
