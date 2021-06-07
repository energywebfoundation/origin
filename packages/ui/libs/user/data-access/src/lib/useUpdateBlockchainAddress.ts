import {
  getUserControllerMeQueryKey,
  OrganizationStatus,
  useOrganizationControllerSetBlockchainAddress,
  UserStatus,
} from '@energyweb/origin-backend-react-query-client';
import {
  useBlockchainDefaultAccount,
  useBlockchainWeb3Instance,
} from '@energyweb/origin-ui-blockchain';
import { useTranslation } from 'react-i18next';
import { signTypedMessage } from '@energyweb/utils-general';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { useUser } from './useUser';
import { useQueryClient } from 'react-query';
import { userApiErrorHandler } from './notifications';
// import {  } from 'ethers';

export const useUpdateBlockchainAddress = (
  setIsUpdating: (value: boolean) => void
) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const userQuerykey = getUserControllerMeQueryKey();
  const { mutate, error, isError, isSuccess, status } =
    useOrganizationControllerSetBlockchainAddress();

  const { user, userLoading } = useUser();
  const blockchainAddress = user?.organization?.blockchainAccountAddress;
  const web3 = useBlockchainWeb3Instance();
  const activeAccount = useBlockchainDefaultAccount();

  const registrationMessage = process.env.NX_REGISTRATION_MESSAGE_TO_SIGN;

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
        activeAccount === null ||
        web3?.connection?.url !== 'metamask'
      ) {
        throw Error(t('user.profile.notifications.noBlockchainConnection'));
      } else if (
        user?.organization?.blockchainAccountAddress ===
        activeAccount.toLowerCase()
      ) {
        throw Error(
          t('user.profile.notifications.thisAccountAlreadyConnected')
        );
      }

      setIsUpdating(true);

      signTypedMessage(activeAccount, registrationMessage, web3).then(
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
