import { AccountAssetDTO } from '@energyweb/exchange-react-query-client';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { formatSelectedExchangeItems } from './formatSelectedExchangeItems';
import {
  SelectedItem,
  TUseClaimActionLogic,
  TUseClaimBeneficiariesFormLogic,
} from './types';

export const useClaimActionLogic: TUseClaimActionLogic<
  AccountAssetDTO['asset']['id']
> = ({ selectedIds, exchangeCertificates, allDevices, allFuelTypes }) => {
  const { t } = useTranslation();

  const selectedItems: SelectedItem<AccountAssetDTO['asset']['id']>[] =
    selectedIds
      ? formatSelectedExchangeItems({
          selectedIds,
          exchangeCertificates,
          allDevices,
          allFuelTypes,
        })
      : [];

  return {
    title: t('certificate.exchangeInbox.selectedForClaim'),
    buttonText: t('certificate.exchangeInbox.claimButton'),
    selectedItems,
  };
};

export const useClaimBeneficiaryFormLogic: TUseClaimBeneficiariesFormLogic =
  () => {
    const { t } = useTranslation();
    return {
      initialValues: {
        startDate: '',
        endDate: '',
        purpose: '',
      },
      validationSchema: yup.object({
        startDate: yup
          .string()
          .required()
          .label(t('certificate.blockchainInbox.startDate')),
        endDate: yup
          .string()
          .required()
          .label(t('certificate.blockchainInbox.endDate')),
        purpose: yup
          .string()
          .required()
          .label(t('certificate.blockchainInbox.purpose')),
      }),
      fields: [
        {
          name: 'startDate',
          label: t('certificate.blockchainInbox.startDate'),
          datePicker: true,
          textFieldProps: {
            variant: 'filled' as any,
            margin: 'none',
          },
        },
        {
          name: 'endDate',
          label: t('certificate.blockchainInbox.endDate'),
          datePicker: true,
          textFieldProps: {
            variant: 'filled' as any,
            margin: 'none',
          },
        },
        {
          name: 'purpose',
          label: t('certificate.blockchainInbox.purpose'),
          textFieldProps: {
            variant: 'filled' as any,
            margin: 'none',
          },
        },
      ],
    };
  };
