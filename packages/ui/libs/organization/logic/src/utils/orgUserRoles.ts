import { Role } from '@energyweb/origin-backend-core';

export const roleNames = [
  {
    value: Role.OrganizationAdmin,
    label: 'organization.members.roleOrgAdmin',
  },
  {
    value: Role.OrganizationDeviceManager,
    label: 'organization.members.roleOrgDeviceManager',
  },
  {
    value: Role.OrganizationUser,
    label: 'organization.members.roleOrgMember',
  },
];
