import { OrganizationStatus, UserStatus } from '@energyweb/origin-backend-core';
import { UserDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { useTranslation } from 'react-i18next';

export const useCreateBundleButtonLogic = (user: UserDTO) => {
  const { t } = useTranslation();

  return {
    linkUrl: '/exchange/create-bundle',
    tooltipText: t('exchange.allBundles.createBundle'),
    showButton:
      user?.status === UserStatus.Active &&
      !!user?.organization &&
      user?.organization?.status === OrganizationStatus.Active,
  };
};
