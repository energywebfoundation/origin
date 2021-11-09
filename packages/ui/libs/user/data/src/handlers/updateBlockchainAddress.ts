import {
  getUserControllerMeQueryKey,
  OrganizationStatus,
  useOrganizationControllerSetBlockchainAddress,
  UserStatus,
} from '@energyweb/origin-backend-react-query-client';
import { useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import { signTypedMessage } from '@energyweb/utils-general';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { useWeb3 } from '@energyweb/origin-ui-web3';
import { useUser } from '../fetching';
import { userApiErrorHandler } from './errorHandler';

export const useUpdateBlockchainAddress = (
  registrationMessage: string,
  setIsUpdating: (value: boolean) => void
) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const userQuerykey = getUserControllerMeQueryKey();
  const { mutate, error, isError, isSuccess, status } =
    useOrganizationControllerSetBlockchainAddress();

  const { user, userLoading } = useUser();
  const blockchainAddress = user?.organization?.blockchainAccountAddress;
  const { web3, account } = useWeb3();

  const submitHandler = () => {
    try {
      if (user?.status !== UserStatus.Active) {
        throw Error(
          t('user.profile.notifications.onlyActiveUserCan', {
            status: user.status,
          })
        );
      } else if (
        !user?.organization ||
        user?.organization?.status !== OrganizationStatus.Active
      ) {
        throw Error(t('user.profile.notifications.onlyMembersOfActiveOrgCan'));
      } else if (
        user?.organization?.blockchainAccountAddress === account.toLowerCase()
      ) {
        throw Error(
          t('user.profile.notifications.thisAccountAlreadyConnected')
        );
      }

      setIsUpdating(true);

      signTypedMessage(account, registrationMessage, web3).then(
        (signedMessage) => {
          mutate(
            { data: { signedMessage } },
            {
              onSuccess: () => {
                queryClient.invalidateQueries(userQuerykey);
                showNotification(
                  t('user.profile.notifications.blockchainAccountLinked'),
                  NotificationTypeEnum.Success
                );
              },
              onError: (error: any) => {
                showNotification(
                  error?.response?.data?.message,
                  NotificationTypeEnum.Error
                );
              },
            }
          );
        }
      );

      setIsUpdating(false);
    } catch (error) {
      userApiErrorHandler(error, t);
    }
  };

  return {
    blockchainAddress,
    status,
    isLoading: userLoading,
    isSuccess,
    isError,
    error,
    submitHandler,
  };
};
