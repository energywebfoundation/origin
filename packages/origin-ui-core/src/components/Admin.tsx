import React from 'react';
import { Route, NavLink, Redirect } from 'react-router-dom';
import { Role, isRole } from '@energyweb/origin-backend-core';
// import { PageContent } from './PageContent/PageContent';
// import { CertificateTable, SelectedState } from './CertificateTable';
import { useSelector } from 'react-redux';
import { getUserOffchain } from '../features/users/selectors';
import { useTranslation } from 'react-i18next';
import { useLinks } from '../utils';

export function Admin() {
    const user = useSelector(getUserOffchain);

    const { baseURL, getAdminLink } = useLinks();
    const { t } = useTranslation();

    const isIssuer = isRole(user, Role.Issuer);

    const AdminMenu = [
        {
            key: 'organization_user',
            label: 'navigation.admin.organizationAndUser',
            // component: OrgUserAdmin,
            show: true
        }

        // Sub-menus to be added

        // {
        //     key: 'devices',
        //     label: 'navigation.admin.devices',
        //     // component: DevicesAdmin,
        //     show: true
        // },
        // {
        //     key: 'configuration',
        //     label: 'navigation.admin.configuration',
        //     // component: ConfigAdmin,
        //     show: true
        // },
        // {
        //     key: 'trade',
        //     label: 'navigation.admin.trade',
        //     // component: tradeAdmin,
        //     show: true
        // },
    ];

    const defaultRedirect = {
        pathname: `${getAdminLink()}/${isIssuer ? AdminMenu[4].key : AdminMenu[0].key}`
    };

    return (
        <div className="PageWrapper">
            <div className="PageNav">
                <ul className="NavMenu nav">
                    {AdminMenu.map((menu) => {
                        if (menu.show) {
                            const link = `${getAdminLink()}/${menu.key}`;

                            return (
                                <li key={menu.key}>
                                    <NavLink to={link}>{t(menu.label)}</NavLink>
                                </li>
                            );
                        }
                    })}
                </ul>
            </div>

            <Route
                exact={true}
                path={getAdminLink()}
                render={() => <Redirect to={defaultRedirect} />}
            />

            <Route
                exact={true}
                path={`${baseURL}/`}
                render={() => <Redirect to={defaultRedirect} />}
            />
        </div>
    );
}
