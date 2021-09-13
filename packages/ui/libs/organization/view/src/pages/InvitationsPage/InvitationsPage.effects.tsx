import { InvitationDTO } from '@energyweb/origin-backend-react-query-client';
import { TableActionData } from '@energyweb/origin-ui-core';
import {
  useReceivedInvitationsActions,
  useReceivedInvitationsData,
  useSentOrgInvitationsData,
} from '@energyweb/origin-ui-organization-data';
import {
  useReceivedInvitationsTableLogic,
  useSentInvitationsTableLogic,
} from '@energyweb/origin-ui-organization-logic';
import { Check, Clear } from '@material-ui/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  OrganizationModalsActionsEnum,
  useOrgModalsDispatch,
} from '../../context';

export const useInvitationsPageEffects = () => {
  const { t } = useTranslation();
  const dispatchModals = useOrgModalsDispatch();

  const { isLoading: isSentLoading, invitations: sentInvitations } =
    useSentOrgInvitationsData();
  const sentInvitationsTable = useSentInvitationsTableLogic(
    sentInvitations,
    isSentLoading
  );

  const openRoleChangedModal = () => {
    dispatchModals({
      type: OrganizationModalsActionsEnum.SHOW_ROLE_CHANGED,
      payload: true,
    });
  };

  const { acceptInvite, rejectInvite, isMutating } =
    useReceivedInvitationsActions(openRoleChangedModal);
  const receivedInvitationsActions: TableActionData<InvitationDTO['id']>[] = [
    {
      icon: <Check />,
      name: t('organization.invitations.accept'),
      onClick: acceptInvite,
      loading: isMutating,
    },
    {
      icon: <Clear />,
      name: t('organization.invitations.decline'),
      onClick: rejectInvite,
      loading: isMutating,
    },
  ];
  const { isLoading: isReceivedLoading, invitations: receivedInvitations } =
    useReceivedInvitationsData();
  const receivedInvitationsTable = useReceivedInvitationsTableLogic(
    receivedInvitations,
    receivedInvitationsActions,
    isReceivedLoading
  );

  const pageLoading = isSentLoading || isReceivedLoading;

  const showSentTable = sentInvitationsTable.data.length > 0;
  const showReceivedTable = receivedInvitationsTable.data.length > 0;
  const showNoInvitationsText = !showSentTable && !showReceivedTable;
  const noInvitationsText = t('organization.invitations.noInvitations');

  return {
    pageLoading,
    showSentTable,
    showReceivedTable,
    showNoInvitationsText,
    noInvitationsText,
    sentInvitationsTable,
    receivedInvitationsTable,
  };
};
