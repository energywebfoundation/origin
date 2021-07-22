import { useUserControllerReSendEmailConfirmation } from '@energyweb/origin-backend-react-query-client';
import { useCallback } from 'react';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';

export const useApiResendConfirmationEmail = () => {
  const { isLoading, error, isError, isSuccess, status, mutateAsync } =
    useUserControllerReSendEmailConfirmation();

  const { t } = useTranslation();
  return {
    status,
    isLoading,
    isSuccess,
    isError,
    error,
    submitHandler: useCallback((): void => {
      mutateAsync().then(
        () => {
          showNotification(
            t('user.feedback.confirmationEmailResent'),
            NotificationTypeEnum.Success
          );
        },
        (reason) => {
          showNotification(
            t('user.feedback.confirmationEmailResentFailed'),
            NotificationTypeEnum.Error
          );
        }
      );
    }, []),
  };
};
