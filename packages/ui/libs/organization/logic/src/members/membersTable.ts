import { getRolesFromRights } from '@energyweb/origin-backend-core';
import { useTranslation } from 'react-i18next';
import { roleNamesMatcherForMembersPage } from '../utils';
import { TFormatOrgMembers, TUseMembersTableLogic } from './types';

export const formatOrgMembers: TFormatOrgMembers = ({ t, users, actions }) => {
  return users?.map((user) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: getRolesFromRights(user.rights)?.map((role) =>
      t(
        roleNamesMatcherForMembersPage.filter(
          (roleName) => roleName.value === role
        )[0].label
      )
    ),
    actions,
  }));
};

export const useMembersTableLogic: TUseMembersTableLogic = ({
  users,
  actions,
  loading,
}) => {
  const { t } = useTranslation();
  return {
    tableTitle: t('organization.members.tableTitle'),
    tableTitleProps: { variant: 'h5' },
    header: {
      firstName: t('organization.members.firstName'),
      lastName: t('organization.members.lastName'),
      email: t('organization.members.email'),
      role: t('organization.members.role'),
      actions: '',
    },
    loading: loading,
    data: formatOrgMembers({ t, users, actions }) ?? [],
  };
};
