import React from 'react';
import { Route, NavLink, Redirect } from 'react-router-dom';
import { ProducingAssetTable } from './ProducingAssetTable';
import { ConsumingAssetTable } from './ConsumingAssetTable';
import { PageContent } from '../elements/PageContent/PageContent';
import { ProducingAssetDetailView } from './ProducingAssetDetailView';
import { ConsumingAssetDetailView } from './ConsumingAssetDetailView';
import { AssetMap } from './AssetMap';
import { useLinks } from '../utils/routing';

export function Asset() {
    function ProductionDetailView(id: number): JSX.Element {
        return (
            <ProducingAssetDetailView
                id={id}
                addSearchField={true}
                showCertificates={true}
                showSmartMeterReadings={true}
            />
        );
    }

    function ConsumingDetailView(id: number): JSX.Element {
        return <ConsumingAssetDetailView id={id} />;
    }

    const { baseURL, getAssetsLink } = useLinks();

    const Map = () => <AssetMap height="700px" />;

    const AssetsMenu = [
        {
            key: 'production',
            label: 'Production List',
            component: ProducingAssetTable
        },
        {
            key: 'production-map',
            label: 'Production Map',
            component: Map
        },
        {
            key: 'consumption',
            label: 'Consumption List',
            component: ConsumingAssetTable
        },
        {
            key: 'producing_detail_view',
            label: 'Production Detail',
            component: null,
            hide: true
        },
        {
            key: 'consuming_detail_view',
            label: 'Consumption Detail',
            component: null,
            hide: true
        }
    ];

    return (
        <div className="PageWrapper">
            <div className="PageNav">
                <ul className="NavMenu nav">
                    {AssetsMenu.map(menu => {
                        if (menu.hide) {
                            return null;
                        }

                        return (
                            <li key={menu.key}>
                                <NavLink to={`${getAssetsLink()}/${menu.key}`}>
                                    {menu.label}
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <Route
                path={`${getAssetsLink()}/:key/:id?`}
                render={props => {
                    const key = props.match.params.key;
                    const id = props.match.params.id;
                    const matches = AssetsMenu.filter(item => {
                        return item.key === key;
                    });
                    if (matches.length > 0 && key === 'producing_detail_view') {
                        matches[0].component = () =>
                            ProductionDetailView(id ? parseInt(id, 10) : id);
                    } else if (matches.length > 0 && key === 'consuming_detail_view') {
                        matches[0].component = () =>
                            ConsumingDetailView(id ? parseInt(id, 10) : id);
                    }

                    return (
                        <PageContent
                            menu={matches.length > 0 ? matches[0] : null}
                            redirectPath={getAssetsLink()}
                        />
                    );
                }}
            />
            <Route
                exact={true}
                path={getAssetsLink()}
                render={() => (
                    <Redirect to={{ pathname: `${getAssetsLink()}/${AssetsMenu[0].key}` }} />
                )}
            />
            <Route
                exact={true}
                path={`${baseURL}/`}
                render={() => (
                    <Redirect to={{ pathname: `${getAssetsLink()}/${AssetsMenu[0].key}` }} />
                )}
            />
        </div>
    );
}
