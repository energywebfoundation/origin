import { CertificateDTO } from '@energyweb/issuer-irec-api-react-query-client';
import {
  EnergyTypeEnum,
  formatDate,
  PowerFormatter,
} from '@energyweb/origin-ui-utils';
import { useTranslation } from 'react-i18next';
import { getEnergyTypeImage, getMainFuelType } from '../utils';
import { SelectedItem, TUseDepositActionLogic } from './types';

export const useDepositActionLogic: TUseDepositActionLogic = <Id>({
  selectedIds,
  blockchainCertificates,
  myDevices,
  allFuelTypes,
}) => {
  const { t } = useTranslation();

  const selectedItems: SelectedItem<Id>[] = selectedIds
    ? selectedIds.map((selectedId) => {
        const certificate = (blockchainCertificates as CertificateDTO[]).find(
          (item) => item.id === selectedId
        );
        const matchingDevice = myDevices.find(
          (device) => device.externalRegistryId === certificate.deviceId
        );

        const { mainType } = getMainFuelType(
          matchingDevice.fuelType,
          allFuelTypes
        );
        const icon = getEnergyTypeImage(
          mainType.toLowerCase() as EnergyTypeEnum,
          true
        );

        const startDate = formatDate(certificate.generationStartTime * 1000);
        const endDate = formatDate(certificate.generationEndTime * 1000);
        const generationTime = `${startDate} - ${endDate}`;
        return {
          id: selectedId,
          icon,
          deviceName: matchingDevice.name,
          energy: PowerFormatter.format(
            Number(certificate.energy.publicVolume),
            true
          ),
          generationTime,
        };
      })
    : [];

  return {
    title: t('certificate.blockchainInbox.selectedForDeposit'),
    buttonText: t('certificate.blockchainInbox.depositButton'),
    selectedItems,
  };
};
