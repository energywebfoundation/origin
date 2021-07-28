import { OrderDTO } from '@energyweb/exchange-irec-react-query-client';
import { TableActionData } from '@energyweb/origin-ui-core';
import {
  useApiAllDevices,
  useApiCancelOrderHandler,
  useApiMyDevices,
} from '@energyweb/origin-ui-exchange-data';
import { useMyOrdersAsksTableLogic } from '@energyweb/origin-ui-exchange-logic';
import { Remove, Visibility } from '@material-ui/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ExchangeModalsActionsEnum,
  useExchangeModalsDispatch,
} from '../../../context';
import { AsksTableProps } from './AsksTable';

export const useAsksTableEffects = ({ asks, isLoading }: AsksTableProps) => {
  const { allDevices, isLoading: areDevicesLoading } = useApiAllDevices();

  const { t } = useTranslation();
  const dispatchModals = useExchangeModalsDispatch();

  const askText = t('exchange.myOrders.ask');
  const removeHandler = useApiCancelOrderHandler(askText);
  const openRemoveModal = (id: OrderDTO['id']) => {
    dispatchModals({
      type: ExchangeModalsActionsEnum.SHOW_REMOVE_ORDER_CONFIRM,
      payload: {
        open: true,
        id,
        removeHandler,
      },
    });
  };

  const openDetailsModal = (id: OrderDTO['id']) => {
    const orderToShow = asks?.find((ask) => ask.id === id);
    dispatchModals({
      type: ExchangeModalsActionsEnum.SHOW_ORDER_DETAILS,
      payload: {
        open: true,
        order: orderToShow,
      },
    });
  };

  const actions: TableActionData<OrderDTO['id']>[] = [
    {
      name: t('exchange.myOrders.remove'),
      icon: <Remove />,
      onClick: (id: OrderDTO['id']) => openRemoveModal(id),
    },
    {
      name: t('exchange.myOrders.view'),
      icon: <Visibility />,
      onClick: (id: OrderDTO['id']) => openDetailsModal(id),
    },
  ];

  const tableData = useMyOrdersAsksTableLogic({
    asks,
    allDevices,
    isLoading: isLoading || areDevicesLoading,
    actions,
    openDetailsModal,
  });
  return tableData;
};
