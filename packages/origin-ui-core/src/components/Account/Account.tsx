import React from 'react';
import { useSelector } from 'react-redux';
import { NavLink, Route, Redirect } from 'react-router-dom';

import { PageContent } from '../PageContent/PageContent';
import { useLinks } from '../../utils/routing';
import { getUserOffchain } from '../../features/users/selectors';
import { AccountImport } from './AccountImport';
import { AccountSettings } from './AccountSettings';
import { UserRegister } from './UserRegister';
import { UserLogin } from './UserLogin';
import { dataTest } from '../../utils/helper';

export function Account() {
    const userOffchain = useSelector(getUserOffchain);

    const { getAccountLink } = useLinks();

    const isLoggedIn = Boolean(userOffchain);

    const Menu = [
        {
            key: 'settings',
            label: 'Settings',
            component: AccountSettings
        },
        {
            key: 'import',
            label: 'Import',
            component: AccountImport
        },
        {
            key: 'user-login',
            label: 'Login',
            component: UserLogin,
            hide: isLoggedIn
        },
        {
            key: 'user-register',
            label: 'Register user',
            component: UserRegister,
            hide: isLoggedIn
        }
    ];

    return (
        <div className="PageWrapper">
            <div className="PageNav">
                <ul className="NavMenu nav">
                    {Menu.map(menu => {
                        if (menu.hide) {
                            return null;
                        }

                        return (
                            <li key={menu.key}>
                                <NavLink
                                    exact={true}
                                    to={`${getAccountLink()}/${menu.key}`}
                                    activeClassName="active"
                                    {...dataTest(`account-link-${menu.key}`)}
                                >
                                    {menu.label}
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <Route
                path={`${getAccountLink()}/:key/:id?`}
                render={props => {
                    const key = props.match.params.key;
                    const matches = Menu.filter(item => {
                        return item.key === key;
                    });

                    return (
                        <PageContent
                            menu={matches.length > 0 ? matches[0] : null}
                            redirectPath={getAccountLink()}
                        />
                    );
                }}
            />

            <Route
                exact={true}
                path={`${getAccountLink()}`}
                render={() => <Redirect to={{ pathname: `${getAccountLink()}/${Menu[0].key}` }} />}
            />
        </div>
    );
}
