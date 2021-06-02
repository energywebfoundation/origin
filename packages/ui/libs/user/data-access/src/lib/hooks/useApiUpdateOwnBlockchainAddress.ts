import { useAdminControllerUpdateBlockchainAddress } from '@energyweb/origin-backend-react-query-client';
import { UnpackNestedValue } from 'react-hook-form';
import { useCallback } from 'react';
import {
  useAccount,
  useAccountSetRefreshTokenDispatch,
} from '@energyweb/origin-ui-user-view';
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
import { TUserBlockchainAccountAddressFormValues } from '@energyweb/origin-ui-user-logic';
import { UpdateBlockchainAccountDTO } from '@energyweb/origin-backend-react-query-client';

export const useApiUpdateOwnBlockchainAddress = () => {
  const { mutateAsync, isLoading, error, isError, isSuccess, status } =
    useAdminControllerUpdateBlockchainAddress();

  const { userAccountData: user } = useAccount();
  const web3 = useBlockchainWeb3Instance();
  const { t } = useTranslation();
  const activeAccountAddress = useBlockchainDefaultAccount();
  const refreshUserAccountData = useAccountSetRefreshTokenDispatch();
  return {
    status,
    isLoading,
    isSuccess,
    isError,
    error,
    submitHandler: useCallback(
      ({
        blockchainAccountAddress, // === activeAccount
      }: UnpackNestedValue<TUserBlockchainAccountAddressFormValues>) => {
        if (activeAccountAddress === null) {
          throw new Error(t('user.profile.noBlockchainConnection'));
        } else if (
          user?.organization.blockchainAccountAddress ===
          activeAccountAddress.toLowerCase()
        ) {
          throw new Error(t('user.feedback.thisAccountAlreadyConnected'));
        }

        const signingAddress = blockchainAccountAddress || activeAccountAddress;
        signTypedMessage(
          signingAddress,
          process.env.NX_REGISTRATION_MESSAGE_TO_SIGN,
          web3 as any // version missmatch
        ).then(
          (value) => {
            const payload: UpdateBlockchainAccountDTO = {
              signedMessage: value,
              address: signingAddress,
            };
            return mutateAsync({
              id: user.organization.id,
              data: payload,
            }).then(() => {
              refreshUserAccountData();
              console.log('useApiAdminUpdateOwnBlockchainAddress => success');
              showNotification(
                t('settings.feedback.blockchainAccountLinked'),
                NotificationTypeEnum.Success
              );
            });
          },
          (error) => {
            if (error?.data?.message) {
              showNotification(error.data.message, NotificationTypeEnum.Error);
            } else if (error?.response) {
              showNotification(
                error.response.data.message,
                NotificationTypeEnum.Error
              );
            } else if (error?.message) {
              showNotification(error.message, NotificationTypeEnum.Error);
            } else {
              console.warn('Could not log in.', error);
              showNotification(
                t('general.feedback.unknownError'),
                NotificationTypeEnum.Error
              );
            }
          }
        );
      },
      [user, web3, t, activeAccountAddress]
    ),
  };
};
