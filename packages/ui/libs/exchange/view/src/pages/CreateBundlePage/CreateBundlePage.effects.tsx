import {
  useAllDeviceFuelTypes,
  useApiAllDevices,
  useApiAllExchangeCertificates,
  useApiPermissions,
} from '@energyweb/origin-ui-exchange-data';
import { useCreateBundleLogic } from '@energyweb/origin-ui-exchange-logic';
import { ListAction } from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import {
  ListItemContent,
  ListItemHeader,
  SellAsBundleAction,
} from '../../containers';

export const useCreateBundlePageEffects = () => {
  const { t } = useTranslation();

  const { permissions } = useApiPermissions();
  const { exchangeCertificates, isLoading: areCertificatesLoading } =
    useApiAllExchangeCertificates();
  const { allDevices, isLoading: areDevicesLoading } = useApiAllDevices();
  const { allTypes: allFuelTypes, isLoading: areFuelTypesLoading } =
    useAllDeviceFuelTypes();

  const isLoading =
    areCertificatesLoading || areDevicesLoading || areFuelTypesLoading;

  const actions: ListAction[] = [
    {
      name: t('exchange.createBundle.sellAsBundleActionTitle'),
      component: SellAsBundleAction,
    },
  ];

  const listProps = useCreateBundleLogic({
    exchangeCertificates,
    allDevices,
    allFuelTypes,
    actions,
    ListItemHeader,
    ListItemContent,
  });

  const noCertificatesText = t('exchange.createBundle.noCertificates');

  return { isLoading, listProps, noCertificatesText, permissions };
};
