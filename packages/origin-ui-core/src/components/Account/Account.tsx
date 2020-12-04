import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { NavLink, Route, Redirect } from 'react-router-dom';

import { PageContent } from '../PageContent/PageContent';
import { getUserOffchain, getIRecAccount } from '../../features/users/selectors';
import { AccountSettings } from './AccountSettings';
import { UserRegister } from './UserRegister';
import { dataTest, useLinks, useTranslation } from '../../utils';
import { UserProfile } from './UserProfile';
import { ConfirmEmail } from './ConfirmEmail';
import { IRECConnectForm } from '../Organization/IRECConnectForm';
import { OriginConfigurationContext } from '..';
import { OriginFeature } from '@energyweb/utils-general';

export function Account() {
    const userOffchain = useSelector(getUserOffchain);

    const { baseURL, getAccountLink } = useLinks();
    const { t } = useTranslation();
    const { enabledFeatures } = useContext(OriginConfigurationContext);

    const isLoggedIn = Boolean(userOffchain);
    const organization = useSelector(getUserOffchain)?.organization;
    const iRecAccount = useSelector(getIRecAccount);

    console.log({
        enabledIrec: !enabledFeatures.includes(OriginFeature.IRec),
        enabledIrecConnect: !enabledFeatures.includes(OriginFeature.IRecConnect),
        organization,
        iRecAccount
    });

    const Menu = [
        {
            key: 'settings',
            label: 'settings.navigation.settings',
            component: AccountSettings,
            hide: false
        },
        {
            key: 'user-register',
            label: 'settings.navigation.registerUser',
            component: UserRegister,
            hide: isLoggedIn
        },
        {
            key: 'user-profile',
            label: 'settings.navigation.userProfile',
            component: UserProfile,
            hide: !isLoggedIn
        },
        {
            key: 'confirm-email',
            label: 'settings.navigation.confirmEmail',
            component: ConfirmEmail,
            hide: true
        },
        {
            key: 'connect-irec',
            label: 'settings.navigation.connectIREC',
            component: IRECConnectForm,
            hide:
                !enabledFeatures.includes(OriginFeature.IRec) ||
                !enabledFeatures.includes(OriginFeature.IRecConnect)
        }
    ];

    return (
        <div className="PageWrapper">
            <div className="PageNav">
                <ul className="NavMenu nav">
                    {Menu.map((menu) => {
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
                                    {t(menu.label)}
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <Route
                path={`${getAccountLink()}/:key/:id?`}
                render={(props) => {
                    const key = props.match.params.key;

                    return (
                        <PageContent
                            menu={Menu.find((item) => item.key === key)}
                            redirectPath={getAccountLink()}
                            {...props}
                        />
                    );
                }}
            />

            <Route
                exact={true}
                path={`${getAccountLink()}`}
                render={() => <Redirect to={{ pathname: `${getAccountLink()}/${Menu[0].key}` }} />}
            />
            <Route
                path={`${getAccountLink()}`}
                render={() => <Redirect to={{ pathname: `${getAccountLink()}/${Menu[0].key}` }} />}
            />
            <Route
                exact={true}
                path={`${baseURL}/`}
                render={() => <Redirect to={{ pathname: `${getAccountLink()}/${Menu[0].key}` }} />}
            />
        </div>
    );
}
