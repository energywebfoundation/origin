import {
  Countries,
  EnergyTypeEnum,
  formatDate,
  PowerFormatter,
} from '@energyweb/origin-ui-utils';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { getEnergyTypeImage, getMainFuelType } from '../utils';
import { ExchangeInboxContainers, TUseExchangeInboxLogic } from './types';

export const useExchangeInboxLogic: TUseExchangeInboxLogic = ({
  exchangeCertificates,
  myDevices,
  allFuelTypes,
  actions,
  ListItemHeader,
  ListItemContent,
}) => {
  const { t } = useTranslation();

  const containers: ExchangeInboxContainers = new Map();
  const generationTimeTitle = t('certificate.exchangeInbox.generationTime');
  const viewButtonLabel = t('certificate.exchangeInbox.viewButton');

  if (myDevices && exchangeCertificates) {
    myDevices.forEach((device) => {
      const deviceHasCertificates = exchangeCertificates.find(
        (certificate) =>
          certificate.asset.deviceId === device.externalRegistryId
      );
      if (!deviceHasCertificates) {
        return;
      }
      const certificatesMatchingDevice = exchangeCertificates.filter(
        (certificate) =>
          certificate.asset.deviceId === device.externalRegistryId
      );
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
          const startDate = formatDate(certificate.asset.generationFrom);
          const endDate = formatDate(certificate.asset.generationTo);
          const generationTimeText = `${startDate} - ${endDate}`;
          const formattedEnergy = PowerFormatter.format(
            parseInt(certificate.amount),
            true
          );
          return {
            id: certificate.asset.id,
            component: (
              <ListItemContent
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
    listTitle: t('certificate.exchangeInbox.title'),
    selectAllText: t('certificate.exchangeInbox.selectAll'),
    containers: containers,
    actions: actions,
  };
};
