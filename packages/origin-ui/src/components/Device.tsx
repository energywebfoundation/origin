import React from 'react';
import { useSelector } from 'react-redux';
import { Route, NavLink, Redirect } from 'react-router-dom';
import { ProducingDeviceTable } from './ProducingDeviceTable';
import { AddDevice } from './AddDevice';
import { PageContent } from '../elements/PageContent/PageContent';
import { ProducingDeviceDetailView } from './ProducingDeviceDetailView';
import { DeviceMap } from './DeviceMap';
import { useLinks } from '../utils/routing';
import { getCurrentUser } from '../features/users/selectors';
import { Device as DeviceNamespace } from '@energyweb/device-registry';
import { Role } from '@energyweb/user-registry';

export function Device() {
    const currentUser = useSelector(getCurrentUser);
    const { baseURL, getDevicesLink } = useLinks();

    function ProductionDetailView(id: number): JSX.Element {
        return (
            <ProducingDeviceDetailView
                id={id}
                showCertificates={true}
                showSmartMeterReadings={true}
            />
        );
    }

    function MyDevices() {
        return (
            <ProducingDeviceTable
                owner={currentUser?.id}
                showAddDeviceButton={true}
                actions={{
                    requestCertificates: true
                }}
            />
        );
    }

    function ProductionList() {
        return (
            <ProducingDeviceTable
                hiddenColumns={['status']}
                includedStatuses={[DeviceNamespace.DeviceStatus.Active]}
                actions={{
                    requestCertificates: true
                }}
            />
        );
    }

    function ProductionPendingList() {
        return (
            <ProducingDeviceTable
                includedStatuses={[DeviceNamespace.DeviceStatus.Submitted]}
                actions={{
                    approve: true
                }}
            />
        );
    }

    const Map = () => <DeviceMap height="700px" />;

    const DevicesMenu = [
        {
            key: 'production',
            label: 'All devices',
            component: ProductionList
        },
        {
            key: 'production-map',
            label: 'Map view',
            component: Map
        },
        {
            key: 'owned',
            label: 'My devices',
            component: MyDevices,
            roles: [Role.DeviceManager]
        },
        {
            key: 'pending',
            label: 'Pending',
            component: ProductionPendingList,
            roles: [Role.Issuer]
        },
        {
            key: 'add',
            label: 'Register device',
            component: AddDevice
        },
        {
            key: 'producing_detail_view',
            label: 'Production detail',
            component: null,
            hide: true
        }
    ];

    return (
        <div className="PageWrapper">
            <div className="PageNav">
                <ul className="NavMenu nav">
                    {DevicesMenu.map(menu => {
                        if (
                            menu.hide ||
                            (menu.roles?.length > 0 &&
                                !menu.roles.reduce(
                                    (prev, next) => prev && currentUser?.isRole(next),
                                    true
                                ))
                        ) {
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
