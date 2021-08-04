import { SelectRegularProps } from '@energyweb/origin-ui-core';
import { Dayjs } from 'dayjs';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { formatSelectedBlockchainItems } from './formatSelectedBlockchain';
import {
  SelectedItem,
  TUseBeneficiaryFormLogic,
  TUseRetireActionLogic,
} from './types';

export const useRetireActionLogic: TUseRetireActionLogic = <Id>({
  selectedIds,
  blockchainCertificates,
  allDevices,
  allFuelTypes,
}) => {
  const { t } = useTranslation();

  const selectedItems: SelectedItem<Id>[] = selectedIds
    ? formatSelectedBlockchainItems({
        selectedIds,
        allDevices,
        blockchainCertificates,
        allFuelTypes,
      })
    : [];

  return {
    title: t('certificate.blockchainInbox.selectedForRetirement'),
    buttonText: t('certificate.blockchainInbox.retireButton'),
    selectedItems,
  };
};

export const useBeneficiaryFormLogic: TUseBeneficiaryFormLogic = ({
  allBeneficiaries,
  setSelectedBeneficiary,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  purpose,
  setPurpose,
}) => {
  const { t } = useTranslation();

  const selectorProps: Omit<SelectRegularProps, 'value'> = {
    field: {
      name: 'beneficiaries',
      label: t('certificate.blockchainInbox.selectBeneficiaries'),
      options: allBeneficiaries?.map((beneficiary) => ({
        label: `
        ${t('certificate.blockchainInbox.beneficiaryId')} ${
          beneficiary.irecBeneficiaryId
        },
        ${t('certificate.blockchainInbox.beneficiaryName')} ${
          beneficiary.organization.name
        }
        `,
        value: beneficiary.irecBeneficiaryId,
      })),
    },
    errorExists: false,
    errorText: '',
    onChange: (event) => setSelectedBeneficiary(event.target.value),
  };

  const startPickerProps = {
    field: {
      name: 'startDate',
      label: t('certificate.blockchainInbox.startDate'),
      textFieldProps: { variant: 'filled' as any },
    },
    value: startDate,
    onChange: (event: Dayjs) => setStartDate(event.toISOString()),
  };

  const endPickerProps = {
    field: {
      name: 'endDate',
      label: t('certificate.blockchainInbox.endDate'),
      textFieldProps: { variant: 'filled' as any },
    },
    value: endDate,
    onChange: (event: Dayjs) => setEndDate(event.toISOString()),
  };

  const purposeInputProps = {
    value: purpose,
    onChange: (event: ChangeEvent<HTMLInputElement>) =>
      setPurpose(event.target.value),
    multiline: true,
    fullWidth: true,
    label: t('certificate.blockchainInbox.purpose'),
    variant: 'filled' as any,
  };

  return { selectorProps, startPickerProps, endPickerProps, purposeInputProps };
};
