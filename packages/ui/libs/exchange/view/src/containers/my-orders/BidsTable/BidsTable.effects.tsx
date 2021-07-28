import { OrderDTO } from '@energyweb/exchange-irec-react-query-client';
import { TableActionData } from '@energyweb/origin-ui-core';
import {
  useAllDeviceFuelTypes,
  useApiCancelOrderHandler,
} from '@energyweb/origin-ui-exchange-data';
import { useMyOrdersBidsTableLogic } from '@energyweb/origin-ui-exchange-logic';
import { Remove, Visibility } from '@material-ui/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ExchangeModalsActionsEnum,
  useExchangeModalsDispatch,
} from '../../../context';
import { BidsTableProps } from './BidsTable';

export const useBidsTableEffects = ({ bids, isLoading }: BidsTableProps) => {
  const { allTypes: allFuelTypes, isLoading: areFuelTypesLoading } =
    useAllDeviceFuelTypes();
  const { t } = useTranslation();
  const dispatchModals = useExchangeModalsDispatch();

  const bidText = t('exchange.myOrders.bid');
  const removeHandler = useApiCancelOrderHandler(bidText);
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
    const orderToShow = bids?.find((bid) => bid.id === id);
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

  const tableData = useMyOrdersBidsTableLogic({
    bids,
    isLoading: isLoading || areFuelTypesLoading,
    allFuelTypes,
    actions,
    openDetailsModal,
  });
  return tableData;
};
