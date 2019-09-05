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
import { connect } from 'react-redux';
import { Route, NavLink, Redirect, withRouter, RouteComponentProps } from 'react-router-dom';
import { ProducingAssetTable } from './ProducingAssetTable';
import { ConsumingAssetTable } from './ConsumingAssetTable';
import { PageContent } from '../elements/PageContent/PageContent';
import { ProducingAssetDetailView } from './ProducingAssetDetailView';
import { ConsumingAssetDetailView } from './ConsumingAssetDetailView';
import { AssetMap } from './AssetMap';
import { IStoreState } from '../types';
import { getBaseURL } from '../features/selectors';
import { getAssetsLink } from '../utils/routing';

interface IStateProps {
    baseURL: string;
}

type Props = RouteComponentProps & IStateProps;

class AssetClass extends React.Component<Props> {
    ProductionDetailView(id: number): JSX.Element {
        return (
            <ProducingAssetDetailView
                id={id}
                addSearchField={true}
                showCertificates={true}
                showSmartMeterReadings={true}
            />
        );
    }

    ConsumingDetailView(id: number): JSX.Element {
        return <ConsumingAssetDetailView id={id} />;
    }

    render(): JSX.Element {
        const { baseURL } = this.props;

        const AssetsMenu = [
            {
                key: 'production',
                label: 'Production List',
                component: ProducingAssetTable
            },
            {
                key: 'production-map',
                label: 'Production Map',
                component: () => <AssetMap height="700px" />
            },
            {
                key: 'consumption',
                label: 'Consumption List',
                component: ConsumingAssetTable
            },
            {
                key: 'producing_detail_view',
                label: 'Production Detail',
                component: null
            },
            {
                key: 'consuming_detail_view',
                label: 'Consumption Detail',
                component: null
            }
        ];

        return (
            <div className="PageWrapper">
                <div className="PageNav">
                    <ul className="NavMenu nav">
                        {AssetsMenu.map(menu => {
                            return (
                                <li key={menu.key}>
                                    <NavLink to={`${getAssetsLink(baseURL)}/${menu.key}`}>
                                        {menu.label}
                                    </NavLink>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <Route
                    path={`${getAssetsLink(baseURL)}/:key/:id?`}
                    render={props => {
                        const key = props.match.params.key;
                        const id = props.match.params.id;
                        const matches = AssetsMenu.filter(item => {
                            return item.key === key;
                        });
                        if (matches.length > 0 && key === 'producing_detail_view') {
                            matches[0].component = () =>
                                this.ProductionDetailView(id ? parseInt(id, 10) : id);
                        } else if (matches.length > 0 && key === 'consuming_detail_view') {
                            matches[0].component = () =>
                                this.ConsumingDetailView(id ? parseInt(id, 10) : id);
                        }

                        return (
                            <PageContent
                                menu={matches.length > 0 ? matches[0] : null}
                                redirectPath={getAssetsLink(baseURL)}
                            />
                        );
                    }}
                />
                <Route
                    exact={true}
                    path={getAssetsLink(baseURL)}
                    render={() => (
                        <Redirect
                            to={{ pathname: `${getAssetsLink(baseURL)}/${AssetsMenu[0].key}` }}
                        />
                    )}
                />
                <Route
                    exact={true}
                    path={`${baseURL}/`}
                    render={() => (
                        <Redirect
                            to={{ pathname: `${getAssetsLink(baseURL)}/${AssetsMenu[0].key}` }}
                        />
                    )}
                />
            </div>
        );
    }
}

export const Asset = withRouter(
    connect(
        (state: IStoreState): IStateProps => ({
            baseURL: getBaseURL(state)
        })
    )(AssetClass)
);
