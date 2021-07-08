import { AccountAssetDTO } from '@energyweb/exchange-react-query-client';
import {
  EnergyTypeEnum,
  formatDate,
  PowerFormatter,
} from '@energyweb/origin-ui-utils';
import { useTranslation } from 'react-i18next';
import { getEnergyTypeImage, getMainFuelType } from '../utils';
import { SelectedItem, TUseSellActionLogic } from './types';

export const useSellActionLogic: TUseSellActionLogic = <Id>({
  selectedIds,
  exchangeCertificates,
  myDevices,
  allFuelTypes,
}) => {
  const { t } = useTranslation();

  const selectedItems: SelectedItem<Id>[] = selectedIds
    ? selectedIds.map((selectedId) => {
        const certificate = (exchangeCertificates as AccountAssetDTO[]).find(
          (item) => item.asset.id === selectedId
        );
        const matchingDevice = myDevices.find(
          (device) => device.externalRegistryId === certificate.asset.deviceId
        );

        const { mainType } = getMainFuelType(
          matchingDevice.fuelType,
          allFuelTypes
        );
        const icon = getEnergyTypeImage(
          mainType.toLowerCase() as EnergyTypeEnum,
          true
        );

        const startDate = formatDate(certificate.asset.generationFrom);
        const endDate = formatDate(certificate.asset.generationTo);
        const generationTime = `${startDate} - ${endDate}`;
        return {
          id: selectedId,
          icon,
          deviceName: matchingDevice.name,
          energy: PowerFormatter.format(Number(certificate.amount), true),
          generationTime,
        };
      })
    : [];

  return {
    title: t('certificate.exchangeInbox.selectedForSale'),
    buttonText: t('certificate.exchangeInbox.sellButton'),
    priceInputLabel: t('certificate.exchangeInbox.price'),
    totalPriceText: t('certificate.exchangeInbox.totalPrice'),
    selectedItems,
  };
};
