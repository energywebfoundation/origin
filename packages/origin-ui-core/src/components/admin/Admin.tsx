import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Redirect, Route } from 'react-router-dom';
import { useLinks } from '../../utils';
import { PageContent } from '../PageContent/PageContent';
import { AdminUsersTable } from './AdminUsersTable';
import { AdminUserView } from './AdminUserView';

export function Admin() {
    const { baseURL, getAdminLink } = useLinks();
    const { t } = useTranslation();

    const adminMenu = [
        {
            key: 'manage-user',
            label: t('navigation.admin.users'),
            component: AdminUsersTable
        },
        {
            key: 'user-update',
            label: 'Update',
            component: AdminUserView,
            hide: true
        }
    ];

    return (
        <div className="PageWrapper">
            <div className="PageNav">
                <ul className="NavMenu nav">
                    {adminMenu.map((menu) => {
                        if (menu.hide) {
                            return null;
                        }

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
                    const matches = adminMenu.filter((item) => {
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
                    <Redirect to={{ pathname: `${getAdminLink()}/${adminMenu[0].key}` }} />
                )}
            />
            <Route
                exact={true}
                path={`${baseURL}/`}
                render={() => (
                    <Redirect to={{ pathname: `${getAdminLink()}/${adminMenu[0].key}` }} />
                )}
            />
        </div>
    );
}
