import {
    isRole,
    Role,
    IOrganizationInvitation,
    IUser,
    UserStatus
} from '@energyweb/origin-backend-core';
import { OriginFeature } from '@energyweb/utils-general';
import { OrganizationView } from './OrganizationView';
import { OrganizationUsersTable } from './OrganizationUsersTable';
import { OrganizationInvitations } from './Invitation/OrganizationInvitations';
import { OrganizationInvite } from './Invitation/OrganizationInvite';
import { OrganizationForm } from './OrganizationForm';
import { OrganizationTable } from './OrganizationTable';
import { IRECRegisterForm } from './IRec/IRECRegisterForm';
import { Registration } from '../../utils/irec';

interface IOrganizationMenuItem {
    key: string;
    label: string;
    component: React.ReactType;
    show: boolean;
}

export const organizationMenuCreator = (
    user: IUser,
    invitations: IOrganizationInvitation[],
    enabledFeatures: OriginFeature[],
    iRecAccount: Registration[] = null
): IOrganizationMenuItem[] => {
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
            show:
                enabledFeatures.includes(OriginFeature.IRec) &&
                organization &&
                iRecAccount.length === 0 &&
                !isRole(user, Role.Admin, Role.SupportAgent)
        }
    ];
};
