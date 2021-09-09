import {
  useInvitationControllerUpdateInvitation,
  InvitationDTO,
  OrganizationInvitationStatus,
  getInvitationControllerGetInvitationsQueryKey,
  getUserControllerMeQueryKey,
} from '@energyweb/origin-backend-react-query-client';
import { useQueryClient } from 'react-query';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';

export const useReceivedInvitationsActions = (
  openRoleChangedModal: () => void
) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const invitationsKey = getInvitationControllerGetInvitationsQueryKey();
  const userKey = getUserControllerMeQueryKey();

  const { mutate, isLoading: isMutating } =
    useInvitationControllerUpdateInvitation({
      onSettled: () => {
        queryClient.invalidateQueries(invitationsKey);
        queryClient.invalidateQueries(userKey);
      },
    });

  const acceptInvite = (id: InvitationDTO['id']) =>
    mutate(
      {
        id: id.toString(),
        status: OrganizationInvitationStatus.Accepted,
      },
      {
        onSuccess: () => {
          showNotification(
            t('organization.invitations.notifications.acceptedSuccess'),
            NotificationTypeEnum.Success
          );
          openRoleChangedModal();
        },
        onError: (error: any) => {
          showNotification(
            `${t('organization.invitations.notifications.acceptedFailure')}:
            ${error?.response?.data?.message || ''}
            `,
            NotificationTypeEnum.Error
          );
        },
      }
    );

  const rejectInvite = (id: InvitationDTO['id']) =>
    mutate(
      {
        id: id.toString(),
        status: OrganizationInvitationStatus.Rejected,
      },
      {
        onSuccess: () => {
          showNotification(
            t('organization.invitations.notifications.rejectedSuccess'),
            NotificationTypeEnum.Success
          );
        },
        onError: (error: any) => {
          showNotification(
            `${t('organization.invitations.notifications.rejectedFailure')}:
            ${error?.response?.data?.message || ''}
            `,
            NotificationTypeEnum.Error
          );
        },
      }
    );

  return { acceptInvite, rejectInvite, isMutating };
};
