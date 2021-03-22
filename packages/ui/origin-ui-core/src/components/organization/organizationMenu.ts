import { useSelector } from 'react-redux';
import { isRole, Role, UserStatus } from '@energyweb/origin-backend-core';
import { OriginFeature } from '@energyweb/utils-general';
import { getUserOffchain, getIRecAccount, getInvitations } from '../../features/users';
import { OrganizationInvitations } from './Invitation/OrganizationInvitations';
import { OrganizationInvite } from './Invitation/OrganizationInvite';
import { IRECRegisterForm } from './IRec/IRECRegisterForm';
import { OrganizationUsersTable } from './OrganizationUsersTable';
import { OrganizationForm } from './OrganizationForm';
import { OrganizationTable } from './OrganizationTable';
import { OrganizationView } from './OrganizationView';

interface IOrganizationMenuItem {
    key: string;
    label: string;
    component: React.ReactType;
    show: boolean;
    feature?: OriginFeature;
}

export const useOrganizationMenu = (): IOrganizationMenuItem[] => {
    const user = useSelector(getUserOffchain);
    const invitations = useSelector(getInvitations);
    const iRecAccount = useSelector(getIRecAccount);

    const showInvitations: boolean =
        user?.organization?.id && isRole(user, Role.OrganizationAdmin)
            ? true
            : invitations.length > 0;
    const isLoggedIn = Boolean(user);
    const userIsActive = user && user.status === UserStatus.Active;
    const organization = user?.organization;

    return [
        {
            key: 'my-organization',
            label: 'My Organization',
            component: OrganizationView,
            show: Boolean(user?.organization?.id)
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
            feature: OriginFeature.IRec,
            show:
                organization &&
                iRecAccount.length === 0 &&
                !isRole(user, Role.Admin, Role.SupportAgent)
        }
    ];
};
