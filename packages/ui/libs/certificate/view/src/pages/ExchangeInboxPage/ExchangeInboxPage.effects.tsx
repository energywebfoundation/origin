import {
  useAllFuelTypes,
  useApiAllExchangeCertificates,
  useApiMyDevices,
} from '@energyweb/origin-ui-certificate-data';
import { useExchangeInboxLogic } from '@energyweb/origin-ui-certificate-logic';
import { ListAction } from '@energyweb/origin-ui-core';
import {
  ListItemContent,
  ListItemHeader,
  SellAction,
  WithdrawAction,
} from '../../containers';

export const useExchangeInboxPageEffects = () => {
  const { exchangeCertificates, isLoading: areCertificatesLoading } =
    useApiAllExchangeCertificates();
  const { myDevices, isLoading: areDevicesLoading } = useApiMyDevices();
  const { allTypes: allFuelTypes, isLoading: areFuelTypesLoading } =
    useAllFuelTypes();

  const isLoading =
    areCertificatesLoading || areDevicesLoading || areFuelTypesLoading;

  const actions: ListAction[] = [
    {
      name: 'Sell',
      component: SellAction,
    },
    {
      name: 'Withdraw',
      component: WithdrawAction,
    },
  ];

  const listProps = useExchangeInboxLogic({
    exchangeCertificates,
    myDevices,
    allFuelTypes,
    actions,
    ListItemHeader,
    ListItemContent,
  });

  return { isLoading, listProps };
};
