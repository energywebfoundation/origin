import {
  getUserControllerGetQueryKey,
  UpdateUserDTO,
  useAdminControllerUpdateUser,
} from '@energyweb/origin-backend-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router';

export const useAdminUpdateUser = (id: string) => {
  const { mutate } = useAdminControllerUpdateUser();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const idAsNumber = parseInt(id);
  const currentUserQueryKey = getUserControllerGetQueryKey(idAsNumber);

  const submitHandler = (values: UpdateUserDTO) => {
    mutate(
      { id: idAsNumber, data: values },
      {
        onSuccess: () => {
          queryClient.resetQueries(currentUserQueryKey);
          showNotification(
            t('admin.updateUser.notifications.userUpdateSuccess'),
            NotificationTypeEnum.Success
          );
          navigate('/admin/users');
        },
        onError: (error: any) => {
          showNotification(
            `${t('admin.updateUser.notifications.userUpdateError')}:
            ${error?.response?.data?.message || ''}
            `,
            NotificationTypeEnum.Error
          );
        },
      }
    );
  };

  return submitHandler;
};
