import { useTranslation } from 'react-i18next';
import { formatSelectedBlockchainItems } from './formatSelectedBlockchain';
import {
  SelectedItem,
  TUseBeneficiariesSelectorLogic,
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

export const useBeneficiariesSelectorLogic: TUseBeneficiariesSelectorLogic = (
  allBeneficiaries,
  setSelectedBeneficiary
) => {
  const { t } = useTranslation();
  return {
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
};
