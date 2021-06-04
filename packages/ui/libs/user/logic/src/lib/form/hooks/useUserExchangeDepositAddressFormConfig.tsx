import {
  GenericFormProps,
  IconPopover,
  IconSize,
} from '@energyweb/origin-ui-core';
import { UnpackNestedValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import React from 'react';
import { Info } from '@material-ui/icons';

export type TUserExchangeDepositAddressFormValues = {
  exchangeDepositAddress: string;
};

export const useUserExchangeDepositAddressFormConfig = (
  exchangeDepositAddress: string,
  formSubmitHandler: (
    values: UnpackNestedValue<TUserExchangeDepositAddressFormValues>
  ) => void
): GenericFormProps<TUserExchangeDepositAddressFormValues> => {
  const { t } = useTranslation();
  return {
    formTitle: t('user.profile.exchangeAddressTitle'),
    formTitleVariant: 'h6',
    buttonText: t('user.profile.createExchangeAddressButton'),
    fields: [
      {
        label: null,
        name: 'exchangeDepositAddress',
        frozen: true,
        endAdornment: {
          element: (
            <IconPopover
              data-cy="exchange-address-info-icon"
              icon={Info}
              iconSize={IconSize.Large}
              popoverText={[
                t('user.profile.popover.exchangeAddressWhatFor'),
                t('user.profile.popover.exchangeAddressHowTo'),
              ]}
            />
          ),
        },
      },
    ],
    buttonWrapperProps: { justifyContent: 'flex-start' },
    initialValues: { exchangeDepositAddress },
    submitHandler: formSubmitHandler,
    inputsVariant: 'filled',
    validationSchema: Yup.object().shape({
      exchangeDepositAddress: Yup.string().label(
        t('user.profile.exchangeDepositAddress')
      ),
    }),
  };
};
