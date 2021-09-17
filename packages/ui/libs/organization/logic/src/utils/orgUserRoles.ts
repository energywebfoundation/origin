import { Role } from '@energyweb/origin-backend-core';
import { TFunction } from 'i18next';

export const roleNamesMatcherForMembersPage = [
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

export const roleNamesMembersPage = (t: TFunction) => [
  {
    value: Role.OrganizationAdmin,
    label: t('organization.members.roleOrgAdmin'),
  },
  {
    value: Role.OrganizationDeviceManager,
    label: t('organization.members.roleOrgDeviceManager'),
  },
  {
    value: Role.OrganizationUser,
    label: t('organization.members.roleOrgMember'),
  },
];

export const roleNamesInvitePage = (t: TFunction) => [
  {
    value: Role.OrganizationUser,
    label: t('organization.invite.member'),
  },
  {
    value: Role.OrganizationDeviceManager,
    label: t('organization.invite.deviceManager'),
  },
  {
    value: Role.OrganizationAdmin,
    label: t('organization.invite.organizationAdmin'),
  },
];
