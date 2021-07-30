import { OrderDTO } from '@energyweb/exchange-irec-react-query-client';
import { FormSelectOption, TableActionData } from '@energyweb/origin-ui-core';
import {
  useAllDeviceFuelTypes,
  useApiCancelOrderHandler,
} from '@energyweb/origin-ui-exchange-data';
import { useMyOrdersBidsTableLogic } from '@energyweb/origin-ui-exchange-logic';
import { Remove, Visibility } from '@material-ui/icons';
import dayjs, { Dayjs } from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
// import { useNavigate } from 'react-router-dom';
import {
  ExchangeModalsActionsEnum,
  useExchangeModalsDispatch,
} from '../../../context';
import {
  EndDateFilter,
  FuelTypeFilter,
  StartDateFilter,
} from '../../table-filters';
import { BidsTableProps } from './BidsTable';

export const useBidsTableEffects = ({ bids, isLoading }: BidsTableProps) => {
  const { allTypes: allFuelTypes, isLoading: areFuelTypesLoading } =
    useAllDeviceFuelTypes();
  const { t } = useTranslation();
  // const navigate = useNavigate();
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

  // const viewMarket = (id: OrderDTO['id']) => {
  //   const bid = bids.find((bid) => bid.id === id);
  //   navigate('/exchange/view-market', { state: {
  //       deviceType: bid.product.deviceType ,
  //       location: bid.product.location,
  //       gridOperator: bid.product.gridOperator,
  //       generationFrom: bid.product.generationFrom,
  //       generationTo: bid.product.generationTo
  //     }
  //   });
  // };

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
    // {
    //   icon: <Search />,
    //   name: t('exchange.myOrders.viewMarket'),
    //   onClick: (id: OrderDTO['id']) => viewMarket(id)
    // },
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
      name: 'fuelType',
      filterFunc: (cellValue: string, filterValue: FormSelectOption[]) => {
        if (!filterValue || filterValue.length < 1) return true;
        const cellTypesArr = cellValue.split(', ');
        const filterTypesArr = filterValue.map((filter) => filter.label);
        return cellTypesArr.some((cellType) =>
          filterTypesArr.includes(cellType)
        );
      },
      component: FuelTypeFilter,
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

  const tableData = useMyOrdersBidsTableLogic({
    bids,
    isLoading: isLoading || areFuelTypesLoading,
    allFuelTypes,
    actions,
    tableFilters,
    openDetailsModal,
  });
  return tableData;
};
