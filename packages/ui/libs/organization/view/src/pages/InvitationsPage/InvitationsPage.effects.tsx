import {
  InvitationDTO,
  useUserControllerMe,
} from '@energyweb/origin-backend-react-query-client';
import {
  useReceivedInvitationsActions,
  useReceivedInvitationsData,
  useSentOrgInvitationsData,
} from '@energyweb/origin-ui-organization-data';
import {
  createReceivedInvitationsTable,
  createSentInvitationsTable,
} from '@energyweb/origin-ui-organization-logic';
import { Check, Clear } from '@material-ui/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const useInvitationsPageEffects = () => {
  const { t } = useTranslation();
  const { data: user } = useUserControllerMe();

  const {
    isLoading: isSentLoading,
    invitations: sentInvitations,
  } = useSentOrgInvitationsData(user?.organization?.id);
  const sentInvitationsTable = createSentInvitationsTable(t, sentInvitations);

  const { acceptInvite, rejectInvite } = useReceivedInvitationsActions();
  const receivedInvitationsActions = [
    {
      icon: <Check />,
      name: t('organization.invitations.accept'),
      onClick: (id: InvitationDTO['id']) => acceptInvite(id),
    },
    {
      icon: <Clear />,
      name: t('organization.invitations.decline'),
      onClick: (id: InvitationDTO['id']) => rejectInvite(id),
    },
  ];
  const {
    isLoading: isReceivedLoading,
    invitations: receivedInvitations,
  } = useReceivedInvitationsData();
  const receivedInvitationsTable = createReceivedInvitationsTable(
    t,
    receivedInvitations,
    receivedInvitationsActions
  );

  const isLoading = isSentLoading && isReceivedLoading;

  const showSentTable = sentInvitationsTable.data.length > 0;
  const showReceivedTable = receivedInvitationsTable.data.length > 0;
  const showNoInvitationsText = !showSentTable && !showReceivedTable;
  const noInvitationsText = t('organization.invitations.noInvitations');

  return {
    isLoading,
    showSentTable,
    showReceivedTable,
    showNoInvitationsText,
    noInvitationsText,
    sentInvitationsTable,
    receivedInvitationsTable,
  };
};
