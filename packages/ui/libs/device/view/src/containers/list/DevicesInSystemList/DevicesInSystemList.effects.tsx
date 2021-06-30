import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { ListItemsContainerProps } from '@energyweb/origin-ui-core';
import {
  ComposedDevice,
  useApiMyDevices,
} from '@energyweb/origin-ui-device-data';
import { PowerFormatter } from '@energyweb/origin-ui-utils';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ListItemContent } from '../ListItemContent';
import { ListItemHeader } from '../ListItemHeader';

export const useDevicesInSystemListEffects = (allFuelTypes: CodeNameDTO[]) => {
  const { myDevices, isLoading } = useApiMyDevices();

  const { t } = useTranslation();
  const listTitle = t('device.import.devicesInSystem');

  const listItems: ListItemsContainerProps<
    ComposedDevice['id'],
    ComposedDevice['id']
  >[] = myDevices?.map((device) => ({
    id: device.id,
    containerHeader: (
      <ListItemHeader
        allFuelTypes={allFuelTypes}
        fuelType={device.fuelType}
        deviceName={device.name}
      />
    ),
    containerItems: [
      {
        id: device.id,
        itemContent: (
          <ListItemContent
            capacity={PowerFormatter.format(device.capacity)}
            country={device.countryCode}
          />
        ),
      },
    ],
  }));

  return { listItems, isLoading, listTitle };
};
