import {
  Bundle,
  getBundleControllerGetMyBundlesQueryKey,
  useBundleControllerCancelBundle,
  useBundleControllerGetMyBundles,
} from '@energyweb/exchange-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

export const useApiMyBundles = () => {
  const { data, isLoading } = useBundleControllerGetMyBundles();

  const myBundles = data?.filter((bundle) => !bundle.isCancelled) || [];

  return { myBundles, isLoading };
};

export const useApiRemoveBundleHandler = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const myBundlesQueryKey = getBundleControllerGetMyBundlesQueryKey();

  const { mutate } = useBundleControllerCancelBundle();

  return (id: Bundle['id']) => {
    mutate(
      { id },
      {
        onSuccess: () => {
          showNotification(
            t('exchange.myBundles.notifications.removeSuccess'),
            NotificationTypeEnum.Success
          );
          queryClient.invalidateQueries(myBundlesQueryKey);
        },
        onError: () => {
          showNotification(
            t('exchange.myBundles.notifications.removeError'),
            NotificationTypeEnum.Success
          );
        },
      }
    );
  };
};
