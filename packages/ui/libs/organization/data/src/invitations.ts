import {
  UserDTO,
  useInvitationControllerGetInvitations,
  useOrganizationControllerGetInvitationsForOrganization,
  useInvitationControllerUpdateInvitation,
  InvitationDTO,
  OrganizationInvitationStatus,
  getInvitationControllerGetInvitationsQueryKey,
  getUserControllerMeQueryKey,
  useUserControllerMe,
} from '@energyweb/origin-backend-react-query-client';
import { useQueryClient } from 'react-query';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';

export const useSentOrgInvitationsData = () => {
  const { data: user, isLoading: userLoading } = useUserControllerMe();

  const {
    data: invitations,
    isLoading: invitationsLoading,
  } = useOrganizationControllerGetInvitationsForOrganization(
    user?.organization?.id
  );

  return { isLoading: userLoading || invitationsLoading, invitations };
};

export const useReceivedInvitationsData = () => {
  const {
    isLoading,
    data: invitations,
  } = useInvitationControllerGetInvitations();

  return { isLoading, invitations };
};

export const useReceivedInvitationsActions = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const invitationsKey = getInvitationControllerGetInvitationsQueryKey();
  const userKey = getUserControllerMeQueryKey();

  const { mutate } = useInvitationControllerUpdateInvitation({
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
