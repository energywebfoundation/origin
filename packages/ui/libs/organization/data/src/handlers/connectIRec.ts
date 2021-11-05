import {
  useConnectionControllerRegister,
  CreateConnectionDTO,
  getConnectionControllerGetMyConnectionQueryKey,
} from '@energyweb/origin-organization-irec-api-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { UseFormReset } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

export const useConnectIRecHandler = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const iRecConnectionQueryKey =
    getConnectionControllerGetMyConnectionQueryKey();
  const { mutate, isLoading } = useConnectionControllerRegister();

  const submitHandler = (
    values: CreateConnectionDTO,
    resetForm: UseFormReset<CreateConnectionDTO>
  ) => {
    mutate(
      { data: values },
      {
        onSuccess: () => {
          resetForm();
          queryClient.invalidateQueries(iRecConnectionQueryKey);
          showNotification(
            t('organization.connectIRec.notifications.connectSuccess'),
            NotificationTypeEnum.Success
          );
        },
        onError: (error: any) => {
          showNotification(
            `${t('organization.connectIRec.notifications.connectError')}:
          ${error?.response?.data?.message || ''}`,
            NotificationTypeEnum.Error
          );
        },
      }
    );
  };

  return { submitHandler, isMutating: isLoading };
};
