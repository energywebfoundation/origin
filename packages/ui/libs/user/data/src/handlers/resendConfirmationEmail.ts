import { useUserControllerReSendEmailConfirmation } from '@energyweb/origin-backend-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';

export const useApiResendConfirmationEmail = () => {
  const { t } = useTranslation();
  const { isLoading, error, isError, isSuccess, status, mutate } =
    useUserControllerReSendEmailConfirmation();

  const submitHandler = () => {
    mutate(null, {
      onSuccess: () => {
        showNotification(
          t('user.profile.notifications.confirmationEmailResentSuccess'),
          NotificationTypeEnum.Success
        );
      },
      onError: (error: any) => {
        showNotification(
          `${t('user.profile.notifications.confirmationEmailResentError')}:
          ${error?.response?.data?.message || ''}
          `,
          NotificationTypeEnum.Error
        );
      },
    });
  };

  return {
    status,
    isLoading,
    isSuccess,
    isError,
    error,
    submitHandler,
  };
};
