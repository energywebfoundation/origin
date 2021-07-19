import {
  Countries,
  EnergyTypeEnum,
  formatDate,
  PowerFormatter,
} from '@energyweb/origin-ui-utils';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { getEnergyTypeImage, getMainFuelType } from '../utils';
import { CreateBundleContainers, TUseCreateBundleLogic } from './types';

export const useCreateBundleLogic: TUseCreateBundleLogic = ({
  exchangeCertificates,
  allDevices,
  allFuelTypes,
  actions,
  ListItemHeader,
  ListItemContent,
}) => {
  const { t } = useTranslation();

  const containers: CreateBundleContainers = new Map();
  const certificationDateTitle = t('exchange.createBundle.certificationDate');

  if (allDevices && exchangeCertificates) {
    allDevices.forEach((device) => {
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
          // createdAt is not a part of DTO
          const certificationDateText = formatDate(
            (certificate.asset as any).createdAt
          );
          const formattedEnergy = PowerFormatter.format(
            parseInt(certificate.amount),
            true
          );
          return {
            id: certificate.asset.id,
            component: (
              <ListItemContent
                certificateId={certificate.asset.tokenId}
                icon={deviceIcon}
                fuelType={deviceFuelType}
                energy={formattedEnergy}
                certificationDateTitle={certificationDateTitle}
                certificationDateText={certificationDateText}
              />
            ),
          };
        }),
      });
    });
  }

  return {
    listTitleProps: { gutterBottom: true, variant: 'h5' },
    checkboxes: true,
    listTitle: t('exchange.createBundle.title'),
    selectAllText: t('exchange.createBundle.selectAll'),
    actionsTabsProps: { scrollButtons: false },
    containers: containers,
    actions: actions,
  };
};
