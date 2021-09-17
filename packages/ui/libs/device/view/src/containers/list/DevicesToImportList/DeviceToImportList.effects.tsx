import {
  CodeNameDTO,
  IrecDeviceDTO,
} from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { ListItemsContainerProps } from '@energyweb/origin-ui-core';
import { useApiDevicesToImport } from '@energyweb/origin-ui-device-data';
import { PowerFormatter } from '@energyweb/origin-ui-utils';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DeviceModalsActionsEnum,
  useDeviceModalsDispatch,
} from '../../../context';
import { ListItemContent } from '../ListItemContent';
import { ListItemHeader } from '../ListItemHeader';

export const useDevicesToImportListEffects = (allFuelTypes: CodeNameDTO[]) => {
  const { devicesToImport, isLoading } = useApiDevicesToImport();

  const { t } = useTranslation();
  const listTitle = t('device.import.devicesToImport');

  const dispatchModals = useDeviceModalsDispatch();

  const handleImportModalOpen = (device: IrecDeviceDTO) => {
    dispatchModals({
      type: DeviceModalsActionsEnum.SHOW_IMPORT_DEVICE,
      payload: {
        open: true,
        deviceToImport: device,
      },
    });
  };

  const listItems: ListItemsContainerProps<
    IrecDeviceDTO['code'],
    IrecDeviceDTO['code']
  >[] = devicesToImport?.map((device) => ({
    id: device.code,
    containerHeader: (
      <ListItemHeader
        allFuelTypes={allFuelTypes}
        fuelType={device.fuelType}
        deviceName={device.name}
        importHandler={() => handleImportModalOpen(device)}
      />
    ),
    containerItems: [
      {
        id: device.code,
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
