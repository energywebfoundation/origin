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
import { useNavigate } from 'react-router';

export const useApiUpdateUserAccountEmail = () => {
  const { mutate, isLoading, error, isError, isSuccess, status } =
    useUserControllerUpdateOwnProfile();

  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userQueryKey = getUserControllerMeQueryKey();

  const submitHandler = (
    values: Pick<UpdateUserProfileDTO, 'email'>,
    resetForm: any
  ) => {
    const user: UserDTO = queryClient.getQueryData(userQueryKey);
    const { firstName, lastName, telephone } = user;
    const restUserProps = { firstName, lastName, telephone };

    return mutate(
      { data: { ...values, ...restUserProps } },
      {
        onSuccess: () => {
          showNotification(
            t('user.profile.notifications.userEmailUpdateSuccess'),
            NotificationTypeEnum.Success
          ),
            queryClient.removeQueries(userQueryKey);
          localStorage.removeItem('AUTHENTICATION_TOKEN');
          navigate('/');
          resetForm();
        },
        onError: (error: AxiosError) => {
          console.error(error);
          showNotification(
            t('user.profile.notifications.userEmailUpdateError'),
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
