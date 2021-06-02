import {
  useAccount,
  useAccountSetRefreshTokenDispatch,
} from '@energyweb/origin-ui-user-view';
import { useTranslation } from 'react-i18next';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { OrganizationStatus, UserStatus } from '@energyweb/origin-backend-core';
import { useAccountControllerCreate } from '@energyweb/exchange-react-query-client';

export const useApiCreateExchangeBlockchainAddress = () => {
  const { mutateAsync, isLoading, error, isError, isSuccess, status } =
    useAccountControllerCreate();

  const { userAccountData: user } = useAccount();
  const { t } = useTranslation();
  return {
    status,
    isLoading,
    isSuccess,
    isError,
    error,
    submitHandler: () => {
      try {
        if (user.status !== UserStatus.Active) {
          showNotification(
            t('user.feedback.onlyActiveUsersCan'),
            NotificationTypeEnum.Success
          );
          throw new Error(t('user.feedback.onlyActiveUsersCan'));
        } else if (
          !user.organization ||
          user.organization.status !== OrganizationStatus.Active
        ) {
          throw new Error(t('user.feedback.onlyMembersOfActiveOrgCan'));
        }

        mutateAsync().then(
          () => {
            useAccountSetRefreshTokenDispatch();
            showNotification(
              t('user.feedback.exchangeAddressSuccess'),
              NotificationTypeEnum.Success
            );
          },
          () => {
            showNotification(
              t('user.feedback.exchangeAddressSuccess'),
              NotificationTypeEnum.Error
            );
          }
        );
      } catch (error) {
        if (error?.message) {
          showNotification(error?.message, NotificationTypeEnum.Error);
        } else {
          console.warn('Could not create exchange deposit address.', error);
          showNotification(
            t('user.feedback.exchangeAddressFailure'),
            NotificationTypeEnum.Error
          );
        }
      }
      // yield put(fromGeneralActions.setLoading(false));
    },
  };
};
