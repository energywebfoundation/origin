import {
  getUserControllerMeQueryKey,
  UpdateUserProfileDTO,
  UserDTO,
  UserStatus,
  useUserControllerUpdateOwnProfile,
} from '@energyweb/origin-backend-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useUser } from '../fetching';

export const useApiUpdateUserAccountEmail = () => {
  const { mutate } = useUserControllerUpdateOwnProfile();
  const { logout } = useUser();

  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const userQueryKey = getUserControllerMeQueryKey();

  const submitHandler = (
    values: Pick<UpdateUserProfileDTO, 'email'>,
    resetForm: any
  ) => {
    const user: UserDTO = queryClient.getQueryData(userQueryKey);
    const { firstName, lastName, telephone, status } = user;
    const restUserProps = { firstName, lastName, telephone };

    if (status !== UserStatus.Active) {
      return showNotification(
        t('user.profile.notifications.onlyActiveUserCan', {
          status: user.status,
        }),
        NotificationTypeEnum.Error
      );
    }

    return mutate(
      { data: { ...values, ...restUserProps } },
      {
        onSuccess: () => {
          showNotification(
            t('user.profile.notifications.userEmailUpdateSuccess'),
            NotificationTypeEnum.Success
          ),
            resetForm();
          logout();
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
    submitHandler,
  };
};