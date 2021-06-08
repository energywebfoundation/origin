import {
  getUserControllerMeQueryKey,
  UpdateUserProfileDTO,
  UserDTO,
  useUserControllerUpdateOwnProfile,
} from '@energyweb/origin-backend-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

export const useApiUpdateUserAccountData = () => {
  const { t } = useTranslation();

  const { mutate, isLoading, error, isError, isSuccess, status } =
    useUserControllerUpdateOwnProfile();

  const queryClient = useQueryClient();
  const userQueryKey = getUserControllerMeQueryKey();

  const submitHandler = (
    values: Omit<UpdateUserProfileDTO, 'email'>,
    resetForm: any
  ) => {
    const user: UserDTO = queryClient.getQueryData(userQueryKey);
    const { email } = user;

    return mutate(
      { data: { ...values, email } },
      {
        onSuccess: () => {
          showNotification(
            t('user.profile.notifications.userInfoUpdateSuccess'),
            NotificationTypeEnum.Success
          );
          queryClient.resetQueries(userQueryKey);
          resetForm();
        },
        onError: (error: AxiosError) => {
          console.error(error);
          showNotification(
            t('user.profile.notifications.userInfoUpdateError'),
            NotificationTypeEnum.Error
          );
        },
      }
    );
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
