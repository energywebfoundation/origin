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
    formTitle: t('user.properties.userBlockchainAddressAccountTitle'),
    formTitleVariant: 'h6',
    buttonText: !activeBlockchainAccountAddress
      ? t('user.actions.connectBlockchain')
      : t('user.actions.connectNewBlockchain'),
    fields: [
      {
        label: t('user.properties.blockchainAccountAddress'),
        name: 'blockchainAccountAddress',
        frozen: true,
        endAdornment: {
          element: (
            <IconPopover
              data-cy="blockchain-address-info-icon"
              icon={Info}
              iconSize={IconSize.Large}
              popoverText={[
                t('user.popover.blockchainWhatIs'),
                t('user.popover.blockchainWhatFor'),
                t('user.popover.blockchainHowTo'),
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
        t('user.properties.blockchainAddress')
      ),
    }),
  };
};
