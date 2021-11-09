import { OrderDTO } from '@energyweb/exchange-irec-react-query-client';
import { TableActionData } from '@energyweb/origin-ui-core';
import {
  useApiAllDevices,
  useApiCancelOrderHandler,
} from '@energyweb/origin-ui-exchange-data';
import { useMyOrdersAsksTableLogic } from '@energyweb/origin-ui-exchange-logic';
import { Remove, Search, Visibility } from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ExchangeModalsActionsEnum,
  useExchangeModalsDispatch,
} from '../../../context';
import {
  EndDateFilter,
  FacilityNameTextFilter,
  StartDateFilter,
} from '../../table-filters';
import { AsksTableProps } from './AsksTable';

export const useAsksTableEffects = ({ asks, isLoading }: AsksTableProps) => {
  const { allDevices, isLoading: areDevicesLoading } = useApiAllDevices();

  const { t } = useTranslation();
  const dispatchModals = useExchangeModalsDispatch();
  const navigate = useNavigate();

  const askText = t('exchange.myOrders.ask');
  const { removeHandler, isMutating } = useApiCancelOrderHandler(askText);
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

  const viewMarket = (id: OrderDTO['id']) => {
    const ask = asks.find((ask) => ask.id === id);
    navigate('/exchange/view-market', {
      state: {
        deviceType: ask.product.deviceType,
        location: ask.product.location,
        gridOperator: ask.product.gridOperator,
        generationFrom: ask.product.generationFrom,
        generationTo: ask.product.generationTo,
      },
    });
  };

  const actions: TableActionData<OrderDTO['id']>[] = [
    {
      name: t('exchange.myOrders.remove'),
      icon: <Remove />,
      onClick: (id: OrderDTO['id']) => openRemoveModal(id),
      loading: isMutating,
    },
    {
      name: t('exchange.myOrders.view'),
      icon: <Visibility />,
      onClick: (id: OrderDTO['id']) => openDetailsModal(id),
    },
    {
      icon: <Search />,
      name: t('exchange.myOrders.viewMarket'),
      onClick: (id: OrderDTO['id']) => viewMarket(id),
    },
  ];

  const tableFilters = [
    {
      name: 'generationStart',
      filterFunc: (cellValue: string, filterValue: Dayjs) => {
        return (
          dayjs(cellValue).isSame(filterValue, 'day') ||
          dayjs(cellValue).isAfter(filterValue)
        );
      },
      component: StartDateFilter,
    },
    {
      name: 'facilityName',
      filterFunc: (cellValue: string, filterValue: string) => {
        return cellValue.toLowerCase().includes(filterValue.toLowerCase());
      },
      component: FacilityNameTextFilter,
    },
    {
      name: 'generationEnd',
      filterFunc: (cellValue: string, filterValue: Dayjs) => {
        return (
          dayjs(cellValue).isSame(filterValue, 'day') ||
          dayjs(cellValue).isBefore(filterValue)
        );
      },
      component: EndDateFilter,
    },
  ];

  const tableData = useMyOrdersAsksTableLogic({
    asks,
    allDevices,
    isLoading: isLoading || areDevicesLoading,
    actions,
    tableFilters,
    openDetailsModal,
  });
  return tableData;
};
