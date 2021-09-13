import { OrganizationStatus } from '@energyweb/origin-backend-core';
import {
  FullOrganizationInfoDTO,
  getOrganizationControllerGetAllQueryKey,
  useOrganizationControllerUpdate,
} from '@energyweb/origin-backend-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

export const useOrgApproveHandler = () => {
  const { mutate, isLoading: isMutating } = useOrganizationControllerUpdate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const allOrgsQueryKey = getOrganizationControllerGetAllQueryKey();

  const approveHandler = (id: FullOrganizationInfoDTO['id']) => {
    mutate(
      { id, data: { status: OrganizationStatus.Active } },
      {
        onSuccess: () => {
          showNotification(
            t('organization.all.notifications.approvedSuccess'),
            NotificationTypeEnum.Success
          );
          queryClient.invalidateQueries(allOrgsQueryKey);
        },
        onError: (error: any) => {
          showNotification(
            `${t('organization.all.notifications.approvedError')}:
            ${error?.response?.data?.message || ''}
            `,
            NotificationTypeEnum.Error
          );
        },
      }
    );
  };

  return { approveHandler, isMutating };
};
