import * as React from 'react';
import { PageContent } from '../../elements/PageContent/PageContent';
import { useSelector } from 'react-redux';
import { getAccountLink } from '../../utils/routing';
import { getBaseURL } from '../../features/selectors';
import { NavLink, Route, Redirect } from 'react-router-dom';
import { AccountImport } from './AccountImport';
import { AccountSettings } from './AccountSettings';
import { dataTest } from '../../utils/Helper';

export function Account() {
    const baseURL = useSelector(getBaseURL);

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
        }
    ];

    return (
        <div className="PageWrapper">
            <div className="PageNav">
                <ul className="NavMenu nav">
                    {Menu.map(menu => {
                        return (
                            <li key={menu.key}>
                                <NavLink
                                    exact={true}
                                    to={`${getAccountLink(baseURL)}/${menu.key}`}
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
                path={`${getAccountLink(baseURL)}/:key/:id?`}
                render={props => {
                    const key = props.match.params.key;
                    const matches = Menu.filter(item => {
                        return item.key === key;
                    });

                    return (
                        <PageContent
                            menu={matches.length > 0 ? matches[0] : null}
                            redirectPath={getAccountLink(baseURL)}
                        />
                    );
                }}
            />

            <Route
                exact={true}
                path={`${getAccountLink(baseURL)}`}
                render={() => (
                    <Redirect to={{ pathname: `${getAccountLink(baseURL)}/${Menu[0].key}` }} />
                )}
            />
        </div>
    );
}
