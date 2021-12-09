import {
  FullOrganizationInfoDTO,
  useOrganizationControllerSetSelfOwnershipFlag,
} from '@energyweb/origin-backend-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';

export const useChangeSelfOwnershipHandler = (
  organizationId: FullOrganizationInfoDTO['id'],
  setOwnership: (value: boolean) => void
) => {
  const { t } = useTranslation();
  const { mutate, isLoading } = useOrganizationControllerSetSelfOwnershipFlag();

  const changeHandler = (selfOwnership: boolean) => {
    mutate(
      { id: organizationId, data: { selfOwnership } },
      {
        onSuccess: () => {
          showNotification(
            t('user.profile.notifications.selfOwnershipChangeSuccess'),
            NotificationTypeEnum.Success
          );
          setOwnership(selfOwnership);
        },
        onError: (error: any) => {
          showNotification(
            `${t('user.profile.notifications.selfOwnershipChangeError')}:
        ${error?.response?.data?.message || ''}
        `,
            NotificationTypeEnum.Error
          );
        },
      }
    );
  };

  return { changeHandler, isMutating: isLoading };
};
