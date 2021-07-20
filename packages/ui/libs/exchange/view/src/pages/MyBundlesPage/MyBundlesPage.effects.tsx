import {
  useAllDeviceFuelTypes,
  useApiAllDevices,
  useApiMyBundles,
  useApiRemoveBundleHandler,
} from '@energyweb/origin-ui-exchange-data';
import { useMyBundlesTablesLogic } from '@energyweb/origin-ui-exchange-logic';
import { Cancel } from '@material-ui/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const useMyBundlesPageEffects = () => {
  const { t } = useTranslation();
  const { myBundles, isLoading: areBundlesLoading } = useApiMyBundles();
  const { allDevices, isLoading: areDevicesLoading } = useApiAllDevices();
  const { allTypes: allFuelTypes, isLoading: areFuelTypesLoading } =
    useAllDeviceFuelTypes();

  const removeHandler = useApiRemoveBundleHandler();

  const actions = [
    {
      icon: <Cancel />,
      name: t('exchange.myBundles.removeBundle'),
      onClick: removeHandler,
    },
  ];

  const isLoading =
    areBundlesLoading || areDevicesLoading || areFuelTypesLoading;
  const tableData = useMyBundlesTablesLogic({
    myBundles,
    allDevices,
    actions,
    allFuelTypes,
    isLoading,
  });

  return tableData;
};
