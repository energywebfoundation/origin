import {
  useAppControllerRequestPasswordReset,
  useAppControllerPasswordReset,
} from '@energyweb/origin-backend-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

export interface RequestResetPasswordFormValues {
  email: string;
}

export const useRequestPasswordResetHandler = () => {
  const { mutate, isLoading: isMutating } =
    useAppControllerRequestPasswordReset();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const requestHandler = (values: RequestResetPasswordFormValues) => {
    mutate(
      { data: values },
      {
        onSuccess: () => {
          showNotification(
            t('user.requestResetPassword.notifications.success'),
            NotificationTypeEnum.Success
          );
          navigate('/login');
        },
        onError: (error: any) => {
          showNotification(
            `${t('user.requestResetPassword.notifications.error')}:
          ${error?.response?.data?.message || ''}
          `,
            NotificationTypeEnum.Error
          );
        },
      }
    );
  };

  return { requestHandler, isMutating };
};

export interface ResetPasswordFormValues {
  password: string;
  passwordConfirm: string;
}

export const useResetPasswordHandler = (token: string) => {
  const { mutate, isLoading: isMutating } = useAppControllerPasswordReset();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const resetHandler = (values: ResetPasswordFormValues) => {
    mutate(
      { data: { password: values.password, token } },
      {
        onSuccess: () => {
          showNotification(
            t('user.resetPassword.notifications.success'),
            NotificationTypeEnum.Success
          );
          navigate('/login');
        },
        onError: (error: any) => {
          showNotification(
            `${t('user.resetPassword.notifications.error')}:
          ${error?.response?.data?.message || ''}
          `,
            NotificationTypeEnum.Error
          );
        },
      }
    );
  };

  return { resetHandler, isMutating };
};
