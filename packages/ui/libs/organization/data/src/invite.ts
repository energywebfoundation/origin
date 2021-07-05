import {
  useOrganizationControllerGetInvitationsForOrganization,
  useInvitationControllerInvite,
  useUserControllerMe,
} from '@energyweb/origin-backend-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';

export const useOrganizationInviteHandler = () => {
  const { t } = useTranslation();

  const { data: user, isLoading: isUserLoading } = useUserControllerMe();
  const {
    data: alreadySentInvitations,
    isLoading: isInvitationsLoading,
  } = useOrganizationControllerGetInvitationsForOrganization(
    user?.organization?.id,
    { enabled: Boolean(user?.organization?.id) }
  );

  const { mutate } = useInvitationControllerInvite({
    onSuccess: () => {
      showNotification(
        t('organization.invite.notifications.invitationSent'),
        NotificationTypeEnum.Success
      );
    },
    onError: (error) => {
      console.log(error);
      showNotification(
        t('organization.invite.notifications.unableToInvite'),
        NotificationTypeEnum.Error
      );
    },
  });

  const submitHandler = (values, reset) => {
    const alreadySent = alreadySentInvitations.some(
      (invitation) => invitation.email === values.email
    );
    if (alreadySent) {
      showNotification(
        t('organization.invite.notifications.alreadySent'),
        NotificationTypeEnum.Info
      );
      return;
    }

    mutate({ data: values });
    reset();
  };

  const apiLoading = isUserLoading || isInvitationsLoading;

  return {
    submitHandler,
    apiLoading,
  };
};