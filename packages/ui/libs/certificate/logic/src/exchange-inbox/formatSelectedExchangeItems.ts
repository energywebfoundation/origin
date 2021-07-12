import { AccountAssetDTO } from '@energyweb/exchange-react-query-client';
import {
  EnergyTypeEnum,
  formatDate,
  PowerFormatter,
} from '@energyweb/origin-ui-utils';
import { getEnergyTypeImage, getMainFuelType } from '../utils';
import { TFormatSelectedExchangeItems } from './types';

export const formatSelectedExchangeItems: TFormatSelectedExchangeItems = ({
  selectedIds,
  exchangeCertificates,
  allDevices,
  allFuelTypes,
}) => {
  return selectedIds.map((selectedId) => {
    const certificate = exchangeCertificates.find(
      (item) =>
        item.asset.id ===
        (selectedId as unknown as AccountAssetDTO['asset']['id'])
    );
    const matchingDevice = allDevices.find(
      (device) => device.externalRegistryId === certificate.asset.deviceId
    );

    const { mainType } = getMainFuelType(matchingDevice.fuelType, allFuelTypes);
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
  });
};
