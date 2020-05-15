import React from 'react';
import { useSelector } from 'react-redux';
import { Route, NavLink, Redirect } from 'react-router-dom';
import { ProducingDeviceTable } from './ProducingDeviceTable';
import { AddDevice } from './AddDevice';
import { DeviceGroupForm } from './DeviceGroupForm';
import { PageContent } from './PageContent/PageContent';
import { ProducingDeviceDetailView } from './ProducingDeviceDetailView';
import { DeviceMap } from './DeviceMap';
import { useLinks } from '../utils';
import { getUserOffchain } from '../features/users/selectors';
import { DeviceStatus, Role, isRole } from '@energyweb/origin-backend-core';

import { useTranslation } from 'react-i18next';

export function Device() {
    const userOffchain = useSelector(getUserOffchain);
    const { baseURL, getDevicesLink } = useLinks();
    const { t } = useTranslation();

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
                owner={userOffchain?.id}
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
                includedStatuses={[DeviceStatus.Active]}
                actions={{
                    requestCertificates: true
                }}
            />
        );
    }

    function ProductionPendingList() {
        return (
            <ProducingDeviceTable
                includedStatuses={[DeviceStatus.Submitted]}
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
            label: t('navigation.devices.all'),
            component: ProductionList
        },
        {
            key: 'production-map',
            label: t('navigation.devices.map'),
            component: Map
        },
        {
            key: 'owned',
            label: t('navigation.devices.my'),
            component: MyDevices,
            roles: [Role.OrganizationDeviceManager, Role.OrganizationAdmin]
        },
        {
            key: 'pending',
            label: t('navigation.devices.pending'),
            component: ProductionPendingList,
            roles: [Role.Issuer]
        },
        {
            key: 'add',
            label: t('navigation.devices.registerDevice'),
            component: AddDevice,
            roles: [Role.OrganizationDeviceManager, Role.OrganizationAdmin]
        },
        {
            key: 'add-group',
            label: t('navigation.devices.registerDeviceGroup'),
            component: DeviceGroupForm,
            roles: [Role.OrganizationDeviceManager, Role.OrganizationAdmin]
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
                    {DevicesMenu.map((menu) => {
                        if (menu.hide || (menu.roles && !isRole(userOffchain, ...menu.roles))) {
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
                render={(props) => {
                    const key = props.match.params.key;
                    const id = props.match.params.id;
                    const matches = DevicesMenu.filter((item) => {
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
