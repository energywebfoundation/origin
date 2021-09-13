import { EmailConfirmationResponse } from '@energyweb/origin-backend-core';
import {
  getUserControllerMeQueryKey,
  UserDTO,
  useUserControllerConfirmToken,
} from '@energyweb/origin-backend-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router';

export const useConfirmEmailHandler = (user: UserDTO) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { mutate } = useUserControllerConfirmToken();
  const queryClient = useQueryClient();
  const userQueryKey = getUserControllerMeQueryKey();

  const confirmHandler = (token: string) => {
    mutate(
      { token },
      {
        onSuccess: (response) => {
          const emailResponse = response as EmailConfirmationResponse;
          const notificationMessage =
            emailResponse === EmailConfirmationResponse.AlreadyConfirmed
              ? 'alreadyConfirmed'
              : emailResponse === EmailConfirmationResponse.Success
              ? 'success'
              : 'expired';

          const notificationType =
            emailResponse === EmailConfirmationResponse.Expired
              ? NotificationTypeEnum.Warning
              : emailResponse === EmailConfirmationResponse.AlreadyConfirmed
              ? NotificationTypeEnum.Info
              : NotificationTypeEnum.Success;

          queryClient.invalidateQueries(userQueryKey);
          showNotification(
            t(`user.confirmEmail.${notificationMessage}`),
            notificationType
          );

          const navigationPath = !user ? '/login' : '/';
          navigate(navigationPath);
        },
        onError: (error: any) => {
          showNotification(
            `${t('user.confirmEmail.error')}:
          ${error?.response?.data?.message || ''}
          `,
            NotificationTypeEnum.Error
          );
          navigate('/');
        },
      }
    );
  };
  return confirmHandler;
};
