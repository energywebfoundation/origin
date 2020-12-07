import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { NavLink, Route, Redirect } from 'react-router-dom';
import { Role, isRole, UserStatus } from '@energyweb/origin-backend-core';
import { OriginConfigurationContext } from '..';
import { OriginFeature } from '@energyweb/utils-general';

import { PageContent } from '../PageContent/PageContent';
import { useLinks } from '../../utils/routing';
import { getUserOffchain, getIRecAccount, getInvitations } from '../../features/users/selectors';
import { OrganizationTable } from './OrganizationTable';
import { OrganizationView } from './OrganizationView';
import { OrganizationInvite } from './OrganizationInvite';
import { OrganizationInvitations } from './OrganizationInvitations';
import { OrganizationUsersTable } from './OrganizationUsersTable';
import { OrganizationForm } from './OrganizationForm';
import { IRECRegisterForm } from './IRECRegisterForm';

export const roleNames = [
    {
        value: Role.OrganizationAdmin,
        label: 'organization.invitations.roles.admin'
    },
    {
        value: Role.OrganizationDeviceManager,
        label: 'organization.invitations.roles.deviceManager'
    },
    {
        value: Role.OrganizationUser,
        label: 'organization.invitations.roles.member'
    }
];

export function Organization() {
    const user = useSelector(getUserOffchain);
    const invitations = useSelector(getInvitations);
    const showInvitations: boolean =
        user?.organization?.id && isRole(user, Role.OrganizationAdmin)
            ? true
            : invitations.length > 0;

    const { getOrganizationLink } = useLinks();
    const { enabledFeatures } = useContext(OriginConfigurationContext);

    const isLoggedIn = Boolean(user);
    const userIsActive = user && user.status === UserStatus.Active;
    const organization = useSelector(getUserOffchain)?.organization;
    const iRecAccount = useSelector(getIRecAccount);

    const Menu = [
        {
            key: 'my-organization',
            label: 'My Organization',
            component: OrganizationView,
            show: user?.organization?.id
        },
        {
            key: 'organization-users',
            label: 'Members',
            component: OrganizationUsersTable,
            show: user?.organization?.id && isRole(user, Role.OrganizationAdmin)
        },
        {
            key: 'organization-invitations',
            label: 'Invitations',
            component: OrganizationInvitations,
            show: showInvitations
        },
        {
            key: 'organization-invite',
            label: 'Invite',
            component: OrganizationInvite,
            show: userIsActive && user?.organization?.id && isRole(user, Role.OrganizationAdmin)
        },
        {
            key: 'organization-register',
            label: 'Register',
            component: OrganizationForm,
            show: !user?.organization?.id
        },
        {
            key: 'organization-table',
            label: 'All organizations',
            component: OrganizationTable,
            show: isLoggedIn && userIsActive && isRole(user, Role.Admin, Role.SupportAgent)
        },
        {
            key: 'organization-view',
            label: 'View',
            component: OrganizationView,
            show: false
        },
        {
            key: 'register-irec',
            label: 'Register I-REC',
            component: IRECRegisterForm,
            show:
                enabledFeatures.includes(OriginFeature.IRec) &&
                organization &&
                iRecAccount.length === 0 &&
                !isRole(user, Role.Admin, Role.SupportAgent)
        }
    ];
    const firstNotHiddenRoute = Menu.filter((i) => i.show)[0]?.key;

    return (
        <div className="PageWrapper">
            <div className="PageNav">
                <ul className="NavMenu nav">
                    {Menu.map((menu) => {
                        if (!menu.show) {
                            return null;
                        }

                        return (
                            <li key={menu.key}>
                                <NavLink
                                    exact={true}
                                    to={`${getOrganizationLink()}/${menu.key}`}
                                    activeClassName="active"
                                >
                                    {menu.label}
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <Route
                path={`${getOrganizationLink()}/:key/:id?`}
                render={(props) => {
                    const key = props.match.params.key;
                    const matches = Menu.filter((item) => {
                        return item.key === key;
                    });

                    return (
                        <PageContent
                            menu={matches.length > 0 ? matches[0] : null}
                            redirectPath={getOrganizationLink()}
                        />
                    );
                }}
            />

            {firstNotHiddenRoute && (
                <Route
                    exact={true}
                    path={`${getOrganizationLink()}`}
                    render={() => (
                        <Redirect
                            to={{
                                pathname: `${getOrganizationLink()}/${firstNotHiddenRoute}`
                            }}
                        />
                    )}
                />
            )}
        </div>
    );
}
