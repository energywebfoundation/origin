import {
  UserDTO,
  useInvitationControllerGetInvitations,
  useOrganizationControllerGetInvitationsForOrganization,
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

export const useSentOrgInvitationsData = (
  orgId: UserDTO['organization']['id']
) => {
  const {
    data: invitations,
    isLoading,
  } = useOrganizationControllerGetInvitationsForOrganization(orgId);

  return { isLoading, invitations };
};

export const useReceivedInvitationsData = () => {
  const {
    isLoading,
    data: invitations,
  } = useInvitationControllerGetInvitations();

  return { isLoading, invitations };
};

export const useReceivedInvitationsActions = () => {
  const queryClient = useQueryClient();
  const invitationsKey = getInvitationControllerGetInvitationsQueryKey();
  const userKey = getUserControllerMeQueryKey();

  const { mutate } = useInvitationControllerUpdateInvitation({
    onSettled: () => {
      queryClient.invalidateQueries(invitationsKey);
      queryClient.invalidateQueries(userKey);
    },
  });
  const { t } = useTranslation();

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
        },
        onError: (error) => {
          console.log(error);
          showNotification(
            t('organization.invitations.notifications.acceptedFailure'),
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
        onError: (error) => {
          console.log(error);
          showNotification(
            t('organization.invitations.notifications.rejectedFailure'),
            NotificationTypeEnum.Error
          );
        },
      }
    );

  return { acceptInvite, rejectInvite };
};
