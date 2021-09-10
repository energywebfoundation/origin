import { CertificateDTO } from '@energyweb/issuer-irec-api-react-query-client';
import {
  EnergyTypeEnum,
  formatDate,
  PowerFormatter,
} from '@energyweb/origin-ui-utils';
import { getEnergyTypeImage, getMainFuelType } from '../utils';
import { TFormatSelectedBlockchainItems } from './types';

export const formatSelectedBlockchainItems: TFormatSelectedBlockchainItems = ({
  selectedIds,
  blockchainCertificates,
  allDevices,
  allFuelTypes,
}) => {
  return selectedIds.map((selectedId) => {
    const certificate = blockchainCertificates.find(
      (item) => item.id === ((selectedId as unknown) as CertificateDTO['id'])
    );
    const matchingDevice = allDevices.find(
      (device) => device.externalRegistryId === certificate.deviceId
    );

    const { mainType } = getMainFuelType(matchingDevice.fuelType, allFuelTypes);
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
  });
};
