import { DeviceStatus } from '@energyweb/origin-backend-core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Redirect, Route } from 'react-router-dom';
import { useLinks } from '../utils';
import { PageContent } from './PageContent/PageContent';
import { ProducingDeviceTable } from './ProducingDeviceTable';

export function Admin() {
    const { baseURL, getAdminLink } = useLinks();
    const { t } = useTranslation();

    function ProductionList() {
        return (
            <ProducingDeviceTable
                includedStatuses={[DeviceStatus.Submitted]}
                actions={{
                    approve: true
                }}
            />
        );
    }

    const DevicesMenu = [
        {
            key: 'manageuser',
            label: t('navigation.admin.users'),
            component: ProductionList
        }
    ];

    return (
        <div className="PageWrapper">
            <div className="PageNav">
                <ul className="NavMenu nav">
                    {DevicesMenu.map((menu) => {
                        return (
                            <li key={menu.key}>
                                <NavLink to={`${getAdminLink()}/${menu.key}`}>{menu.label}</NavLink>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <Route
                path={`${getAdminLink()}/:key/:id?`}
                render={(props) => {
                    const key = props.match.params.key;
                    const matches = DevicesMenu.filter((item) => {
                        return item.key === key;
                    });

                    return (
                        <PageContent
                            menu={matches.length > 0 ? matches[0] : null}
                            redirectPath={getAdminLink()}
                        />
                    );
                }}
            />
            <Route
                exact={true}
                path={getAdminLink()}
                render={() => (
                    <Redirect to={{ pathname: `${getAdminLink()}/${DevicesMenu[0].key}` }} />
                )}
            />
            <Route
                exact={true}
                path={`${baseURL}/`}
                render={() => (
                    <Redirect to={{ pathname: `${getAdminLink()}/${DevicesMenu[0].key}` }} />
                )}
            />
        </div>
    );
}
