import React from 'react';
import { Route, NavLink, Redirect } from 'react-router-dom';
import { ProducingDeviceTable } from './ProducingDeviceTable';
import { ConsumingDeviceTable } from './ConsumingDeviceTable';
import { PageContent } from '../elements/PageContent/PageContent';
import { ProducingDeviceDetailView } from './ProducingDeviceDetailView';
import { ConsumingDeviceDetailView } from './ConsumingDeviceDetailView';
import { DeviceMap } from './DeviceMap';
import { useLinks } from '../utils/routing';

export function Device() {
    function ProductionDetailView(id: number): JSX.Element {
        return (
            <ProducingDeviceDetailView
                id={id}
                showCertificates={true}
                showSmartMeterReadings={true}
            />
        );
    }

    function ConsumingDetailView(id: number): JSX.Element {
        return <ConsumingDeviceDetailView id={id} />;
    }

    const { baseURL, getDevicesLink } = useLinks();

    const Map = () => <DeviceMap height="700px" />;

    const DevicesMenu = [
        {
            key: 'production',
            label: 'Production List',
            component: ProducingDeviceTable
        },
        {
            key: 'production-map',
            label: 'Production Map',
            component: Map
        },
        {
            key: 'consumption',
            label: 'Consumption List',
            component: ConsumingDeviceTable
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
                    {DevicesMenu.map(menu => {
                        if (menu.hide) {
                            return null;
                        }

                        return (
                            <li key={menu.key}>
                                <NavLink to={`${getDevicesLink()}/${menu.key}`}>
                                    {menu.label}
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <Route
                path={`${getDevicesLink()}/:key/:id?`}
                render={props => {
                    const key = props.match.params.key;
                    const id = props.match.params.id;
                    const matches = DevicesMenu.filter(item => {
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
                            redirectPath={getDevicesLink()}
                        />
                    );
                }}
            />
            <Route
                exact={true}
                path={getDevicesLink()}
                render={() => (
                    <Redirect to={{ pathname: `${getDevicesLink()}/${DevicesMenu[0].key}` }} />
                )}
            />
            <Route
                exact={true}
                path={`${baseURL}/`}
                render={() => (
                    <Redirect to={{ pathname: `${getDevicesLink()}/${DevicesMenu[0].key}` }} />
                )}
            />
        </div>
    );
}
