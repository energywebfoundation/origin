import {
  GenericFormProps,
  IconPopover,
  IconSize,
} from '@energyweb/origin-ui-core';
import { UnpackNestedValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { Info } from '@material-ui/icons';
import React from 'react';

export type TUserBlockchainAccountAddressFormValues = {
  blockchainAccountAddress: string;
};

export const useUserBlockchainAccountAddressFormConfig = (
  activeBlockchainAccountAddress: string,
  formSubmitHandler: (
    values: UnpackNestedValue<TUserBlockchainAccountAddressFormValues>
  ) => void
): GenericFormProps<TUserBlockchainAccountAddressFormValues> => {
  const { t } = useTranslation();
  return {
    hideSubmitButton: Boolean(activeBlockchainAccountAddress),
    formTitle: t('user.profile.blockchainAccountAddress'),
    formTitleVariant: 'h6',
    inputsVariant: 'filled',
    buttonText: !activeBlockchainAccountAddress
      ? t('user.profile.connectBlockchain')
      : t('user.profile.connectNewBlockchain'),
    fields: [
      {
        label: null,
        name: 'blockchainAccountAddress',
        frozen: true,
        endAdornment: {
          element: (
            <IconPopover
              data-cy="blockchain-address-info-icon"
              icon={Info}
              iconSize={IconSize.Large}
              popoverText={[
                t('user.profile.popover.blockchainWhatIs'),
                t('user.profile.popover.blockchainWhatFor'),
                t('user.profile.popover.blockchainHowTo'),
              ]}
            />
          ),
        },
      },
    ],
    buttonWrapperProps: { justifyContent: 'flex-start' },
    initialValues: {
      blockchainAccountAddress: activeBlockchainAccountAddress ?? '',
    },
    submitHandler: formSubmitHandler,
    validationSchema: Yup.object().shape({
      blockchainAccountAddress: Yup.string().label(
        t('user.profile.blockchainAddress')
      ),
    }),
  };
};
