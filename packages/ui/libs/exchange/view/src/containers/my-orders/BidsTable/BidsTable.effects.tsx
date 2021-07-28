import { OrderDTO } from '@energyweb/exchange-irec-react-query-client';
import { TableActionData } from '@energyweb/origin-ui-core';
import {
  useApiCancelOrderHandler,
  useCachedAllFuelTypes,
} from '@energyweb/origin-ui-exchange-data';
import { useMyOrdersBidsTableLogic } from '@energyweb/origin-ui-exchange-logic';
import { Remove } from '@material-ui/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ExchangeModalsActionsEnum,
  useExchangeModalsDispatch,
} from '../../../context';
import { BidsTableProps } from './BidsTable';

export const useBidsTableEffects = ({ bids, isLoading }: BidsTableProps) => {
  const allFuelTypes = useCachedAllFuelTypes();
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

  const actions: TableActionData<OrderDTO['id']>[] = [
    {
      name: t('exchange.myOrders.remove'),
      icon: <Remove />,
      onClick: (id: OrderDTO['id']) => openRemoveModal(id),
    },
  ];

  const tableData = useMyOrdersBidsTableLogic({
    bids,
    isLoading,
    allFuelTypes,
    actions,
  });
  return tableData;
};
