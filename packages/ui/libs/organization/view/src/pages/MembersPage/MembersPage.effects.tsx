import {
  useOrganizationMemberRemove,
  useOrganizationMembersData,
} from '@energyweb/origin-ui-organization-data';
import { createMembersTable } from '@energyweb/origin-ui-organization-logic';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DeleteOutline, PermIdentityOutlined } from '@material-ui/icons';
import {
  User,
  userControllerGet,
} from '@energyweb/origin-backend-react-query-client';
import {
  OrganizationModalsActionsEnum,
  useOrgModalsDispatch,
} from '../../context';

export const useMembersPageEffects = () => {
  const { t } = useTranslation();
  const dispatchModals = useOrgModalsDispatch();

  const { members, isLoading } = useOrganizationMembersData();
  const removeHandler = useOrganizationMemberRemove();

  const openChangeRoleModal = async (id: User['id']) => {
    const preloadedUserToUpdate = await userControllerGet(id);
    dispatchModals({
      type: OrganizationModalsActionsEnum.SHOW_CHANGE_MEMBER_ORG_ROLE,
      payload: {
        open: true,
        userToUpdate: preloadedUserToUpdate,
      },
    });
  };

  const membersActions = [
    {
      icon: <PermIdentityOutlined />,
      name: t('organization.members.editRole'),
      onClick: openChangeRoleModal,
    },
    {
      icon: <DeleteOutline />,
      name: t('organization.members.remove'),
      onClick: (id: User['id']) => removeHandler(id),
    },
  ];

  const tableData = createMembersTable({
    t,
    users: members,
    actions: membersActions,
    loading: isLoading,
  });

  return { isLoading, tableData };
};
