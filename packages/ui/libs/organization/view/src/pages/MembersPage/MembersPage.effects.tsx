import {
  useOrganizationMemberRemove,
  useOrganizationMemberRoleUpdate,
  useOrganizationMembersData,
} from '@energyweb/origin-ui-organization-data';
import { useMembersTableLogic } from '@energyweb/origin-ui-organization-logic';
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
import { TableActionData } from '@energyweb/origin-ui-core';

export const useMembersPageEffects = () => {
  const { t } = useTranslation();
  const dispatchModals = useOrgModalsDispatch();

  const { members, isLoading: membersIsLoading } = useOrganizationMembersData();
  const {
    removeHandler,
    isLoading: removeHandlerIsLoading,
    isMutating: isRemoveMutating,
  } = useOrganizationMemberRemove();
  const { isMutating: isUpdateMemberMutating } =
    useOrganizationMemberRoleUpdate();

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

  const actions: TableActionData<User['id']>[] = [
    {
      icon: <PermIdentityOutlined />,
      name: t('organization.members.editRole'),
      onClick: openChangeRoleModal,
      loading: isUpdateMemberMutating,
    },
    {
      icon: <DeleteOutline />,
      name: t('organization.members.remove'),
      onClick: removeHandler,
      loading: isRemoveMutating,
    },
  ];

  const pageLoading = membersIsLoading || removeHandlerIsLoading;

  const tableData = useMembersTableLogic({
    users: members,
    actions,
    loading: pageLoading,
  });

  return { pageLoading, tableData };
};
