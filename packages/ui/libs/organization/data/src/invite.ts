import {
  useOrganizationControllerGetInvitationsForOrganization,
  useInvitationControllerInvite,
  useUserControllerMe,
  InviteDTO,
} from '@energyweb/origin-backend-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { UseFormReset } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const useOrganizationInviteHandler = () => {
  const { t } = useTranslation();

  const { data: user, isLoading: isUserLoading } = useUserControllerMe();
  const { data: alreadySentInvitations, isLoading: isInvitationsLoading } =
    useOrganizationControllerGetInvitationsForOrganization(
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
    onError: (error: any) => {
      showNotification(
        `${t('organization.invite.notifications.unableToInvite')}:
        ${error?.response?.data?.message || ''}
        `,
        NotificationTypeEnum.Error
      );
    },
  });

  const submitHandler = (values: InviteDTO, reset: UseFormReset<InviteDTO>) => {
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
