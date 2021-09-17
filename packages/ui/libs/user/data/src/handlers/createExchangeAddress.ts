import { useTranslation } from 'react-i18next';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { OrganizationStatus, UserStatus } from '@energyweb/origin-backend-core';
import {
  getAccountControllerGetAccountQueryKey,
  useAccountControllerCreate,
} from '@energyweb/exchange-react-query-client';
import { useQueryClient } from 'react-query';
import { MutableRefObject } from 'react';
import { useUser, pollExchangeAddress } from '../fetching';
import { userApiErrorHandler } from './errorHandler';

export const useApiCreateExchangeBlockchainAddress = (
  setIsCreating: (value: boolean) => void,
  isMountedRef: MutableRefObject<boolean>
) => {
  const {
    mutateAsync,
    isLoading,
    error,
    isError,
    isSuccess,
    status,
  } = useAccountControllerCreate();

  const { user } = useUser();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const exchangeAccountQueryKey = getAccountControllerGetAccountQueryKey();

  const submitHandler = () => {
    try {
      if (user.status !== UserStatus.Active) {
        throw Error(
          t('user.profile.notifications.onlyActiveUserCan', {
            status: user.status,
          })
        );
      } else if (
        !user.organization ||
        user.organization.status !== OrganizationStatus.Active
      ) {
        throw Error(t('user.profile.notifications.onlyMembersOfActiveOrgCan'));
      }

      setIsCreating(true);
      mutateAsync().then(async () => {
        const createdAddress = await pollExchangeAddress(2000);
        queryClient.setQueryData(exchangeAccountQueryKey, createdAddress);

        showNotification(
          t('user.profile.notifications.exchangeAddressSuccess'),
          NotificationTypeEnum.Success
        );
        if (isMountedRef.current) {
          setIsCreating(false);
        }
      });
    } catch (error) {
      userApiErrorHandler(error, t);
    }
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
