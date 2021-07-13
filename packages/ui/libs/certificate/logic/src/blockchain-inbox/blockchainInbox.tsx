import {
  Countries,
  EnergyTypeEnum,
  formatDate,
  PowerFormatter,
} from '@energyweb/origin-ui-utils';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { getEnergyTypeImage, getMainFuelType } from '../utils';
import { BlockchainInboxContainers, TUseBlockchainInboxLogic } from './types';

export const useBlockchainInboxLogic: TUseBlockchainInboxLogic = ({
  blockchainCertificates,
  allDevices,
  allFuelTypes,
  actions,
  ListItemHeader,
  ListItemContent,
}) => {
  const { t } = useTranslation();

  const containers: BlockchainInboxContainers = new Map();
  const generationTimeTitle = t('certificate.blockchainInbox.generationTime');
  const viewButtonLabel = t('certificate.inbox.viewButton');

  if (allDevices && blockchainCertificates) {
    allDevices.forEach((device) => {
      const deviceHasCertificates = blockchainCertificates.find(
        (certificate) => certificate.deviceId === device.externalRegistryId
      );
      if (!deviceHasCertificates) {
        return;
      }
      const certificatesMatchingDevice = blockchainCertificates.filter(
        (certificate) =>
          certificate.deviceId === device.externalRegistryId &&
          parseInt(certificate.energy.publicVolume) > 0
      );
      if (certificatesMatchingDevice.length === 0) {
        return;
      }
      const countryName = Countries.find(
        (country) => country.code === device.countryCode
      )?.name;
      const { mainType: deviceFuelType } = getMainFuelType(
        device.fuelType,
        allFuelTypes
      );
      const deviceIcon = getEnergyTypeImage(deviceFuelType as EnergyTypeEnum);

      containers.set(device.externalRegistryId, {
        containerComponent: (
          <ListItemHeader name={device.name} country={countryName} />
        ),
        containerListItemProps: { style: { padding: 8 } },
        itemListItemProps: { style: { padding: 8 } },
        items: certificatesMatchingDevice.map((certificate) => {
          const startDate = formatDate(certificate.generationStartTime * 1000);
          const endDate = formatDate(certificate.generationEndTime * 1000);
          const generationTimeText = `${startDate} - ${endDate}`;
          const formattedEnergy = PowerFormatter.format(
            parseInt(certificate.energy.publicVolume),
            true
          );
          return {
            id: certificate.id,
            component: (
              <ListItemContent
                certificateId={certificate.id}
                icon={deviceIcon}
                fuelType={deviceFuelType}
                energy={formattedEnergy}
                generationTimeTitle={generationTimeTitle}
                generationTimeText={generationTimeText}
                viewButtonLabel={viewButtonLabel}
              />
            ),
          };
        }),
      });
    });
  }

  return {
    listTitleProps: { gutterBottom: true, variant: 'h5' },
    itemsGridProps: { mt: 6 },
    checkboxes: true,
    listTitle: t('certificate.blockchainInbox.title'),
    selectAllText: t('certificate.inbox.selectAll'),
    containers: containers,
    actions: actions,
    actionsTabsProps: { scrollButtons: false },
  };
};
