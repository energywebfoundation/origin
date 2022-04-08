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

export const useApiMyBundles = (enabled?: boolean) => {
  const { data, isLoading } = useBundleControllerGetMyBundles({
    query: { enabled },
  });

  const myBundles = data?.filter((bundle) => !bundle.isCancelled) || [];

  return { myBundles, isLoading };
};

export const useApiRemoveBundleHandler = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const myBundlesQueryKey = getBundleControllerGetMyBundlesQueryKey();

  const { mutate, isLoading: isMutating } = useBundleControllerCancelBundle();

  const removeHandler = (id: Bundle['id']) => {
    mutate(
      { id },
      {
        onSuccess: () => {
          showNotification(
            t('exchange.myPackages.notifications.removeSuccess'),
            NotificationTypeEnum.Success
          );
          queryClient.invalidateQueries(myBundlesQueryKey);
        },
        onError: () => {
          showNotification(
            t('exchange.myPackages.notifications.removeError'),
            NotificationTypeEnum.Error
          );
        },
      }
    );
  };

  return { removeHandler, isMutating };
};
