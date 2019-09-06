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
import { PageContent } from '../elements/PageContent/PageContent';
import { DemandTable } from './DemandTable';
import { connect } from 'react-redux';
import { getDemandsLink } from '../utils/routing';
import { IStoreState } from '../types';
import { getBaseURL } from '../features/selectors';
import { OnboardDemand } from './OnboardDemand';
import { NavLink, Route, Redirect } from 'react-router-dom';

interface IStateProps {
    baseURL: string;
}

type Props = IStateProps;

class DemandsClass extends React.Component<Props> {
    render() {
        const { baseURL } = this.props;
        const DemandsMenu = [
            {
                key: 'list',
                label: 'List',
                component: DemandTable
            },
            {
                key: 'create',
                label: 'Create',
                component: OnboardDemand
            }
        ];

        return (
            <div className="PageWrapper">
                <div className="PageNav">
                    <ul className="NavMenu nav">
                        {DemandsMenu.map(menu => {
                            return (
                                <li key={menu.key}>
                                    <NavLink
                                        exact={true}
                                        to={`${getDemandsLink(baseURL)}/${menu.key}`}
                                        activeClassName="active"
                                    >
                                        {menu.label}
                                    </NavLink>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <Route
                    path={`${getDemandsLink(baseURL)}/:key`}
                    render={props => {
                        const key = props.match.params.key;
                        const matches = DemandsMenu.filter(item => {
                            return item.key === key;
                        });

                        return (
                            <PageContent
                                menu={matches.length > 0 ? matches[0] : null}
                                redirectPath={getDemandsLink(baseURL)}
                            />
                        );
                    }}
                />

                <Route
                    exact={true}
                    path={`${getDemandsLink(baseURL)}`}
                    render={() => (
                        <Redirect
                            to={{ pathname: `${getDemandsLink(baseURL)}/${DemandsMenu[0].key}` }}
                        />
                    )}
                />
            </div>
        );
    }
}

export const Demands = connect(
    (state: IStoreState): IStateProps => ({
        baseURL: getBaseURL(state)
    })
)(DemandsClass);
