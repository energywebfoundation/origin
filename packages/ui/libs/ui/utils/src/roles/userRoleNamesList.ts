import { Role } from '@energyweb/origin-backend-core';

export const userRoleNamesList = [
  {
    value: Role.OrganizationAdmin,
    label: 'organization.invitations.roles.admin',
  },
  {
    value: Role.OrganizationDeviceManager,
    label: 'organization.invitations.roles.deviceManager',
  },
  {
    value: Role.OrganizationUser,
    label: 'organization.invitations.roles.member',
  },
];
