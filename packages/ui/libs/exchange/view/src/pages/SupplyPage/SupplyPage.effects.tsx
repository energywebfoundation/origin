import React from 'react';
import {
  useApiMyDevices,
  useAllDeviceFuelTypes,
  useAllSupply,
  ComposedPublicDevice,
  useApiPermissions,
} from '@energyweb/origin-ui-exchange-data';
import {
  useLogicSupply,
  createDeviceWithSupply,
} from '@energyweb/origin-ui-exchange-logic';
import {
  useExchangeModalsDispatch,
  ExchangeModalsActionsEnum,
} from '../../context';
import { useTranslation } from 'react-i18next';
import { Edit, Remove } from '@material-ui/icons';

export const useSupplyPageEffects = () => {
  const { t } = useTranslation();

  const dispatchModals = useExchangeModalsDispatch();

  const { permissions } = useApiPermissions();
  const { myDevices: devices, isLoading: areDevicesLoading } =
    useApiMyDevices();

  const { allTypes: allFuelTypes, isLoading: isFuelTypesloading } =
    useAllDeviceFuelTypes();

  const { allSupply: supplies, isLoading: areSuppliesLoading } = useAllSupply();

  const getDeviceWithSupply = (
    id: ComposedPublicDevice['externalRegistryId']
  ) => {
    const device = devices.find((device) => device.externalRegistryId === id);

    const deviceWithSupply = createDeviceWithSupply({
      device,
      supplies,
      allFuelTypes,
    });

    return deviceWithSupply;
  };

  const openUpdateSupplyModal = async (
    id: ComposedPublicDevice['externalRegistryId']
  ) => {
    const deviceWithSupply = getDeviceWithSupply(id);

    dispatchModals({
      type: ExchangeModalsActionsEnum.SHOW_UPDATE_SUPPLY,
      payload: {
        open: true,
        deviceWithSupply,
      },
    });
  };

  const actions = [
    {
      icon: <Edit />,
      name: t('exchange.supply.update'),
      onClick: openUpdateSupplyModal,
    },
    {
      icon: <Remove />,
      name: t('exchange.supply.remove'),
      onClick: (id: ComposedPublicDevice['externalRegistryId']) => {
        const deviceWithSupply = getDeviceWithSupply(id);

        dispatchModals({
          type: ExchangeModalsActionsEnum.SHOW_REMOVE_SUPPLY,
          payload: {
            open: true,
            supplyId: deviceWithSupply?.supplyId,
          },
        });
      },
    },
  ];

  const loading = isFuelTypesloading || areDevicesLoading || areSuppliesLoading;

  const tableData = useLogicSupply({
    devices,
    supplies,
    allFuelTypes,
    actions,
    loading,
  });

  return {
    tableData,
    permissions,
  };
};
