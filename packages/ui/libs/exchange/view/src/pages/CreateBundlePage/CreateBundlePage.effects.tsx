import {
  useAllDeviceFuelTypes,
  useApiAllDevices,
  useApiAllExchangeCertificates,
  useApiUserAndAccount,
} from '@energyweb/origin-ui-exchange-data';
import {
  useCreateBundleLogic,
  usePermissionsLogic,
} from '@energyweb/origin-ui-exchange-logic';
import { ListAction } from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import {
  ListItemContent,
  ListItemHeader,
  SellAsBundleAction,
} from '../../containers';

export const useCreateBundlePageEffects = () => {
  const { t } = useTranslation();

  const {
    user,
    exchangeDepositAddress,
    isLoading: userAndAccountLoading,
  } = useApiUserAndAccount();
  const { canAccessPage, requirementsProps } = usePermissionsLogic({
    user,
    exchangeDepositAddress,
  });
  const {
    exchangeCertificates,
    isLoading: areCertificatesLoading,
  } = useApiAllExchangeCertificates();
  const { allDevices, isLoading: areDevicesLoading } = useApiAllDevices();
  const {
    allTypes: allFuelTypes,
    isLoading: areFuelTypesLoading,
  } = useAllDeviceFuelTypes();

  const isLoading =
    areCertificatesLoading ||
    areDevicesLoading ||
    areFuelTypesLoading ||
    userAndAccountLoading;

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

  return {
    isLoading,
    listProps,
    noCertificatesText,
    canAccessPage,
    requirementsProps,
  };
};
