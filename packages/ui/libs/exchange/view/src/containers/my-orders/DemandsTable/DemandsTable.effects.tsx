import {
  DemandDTO,
  DemandStatus,
  TimeFrame,
} from '@energyweb/exchange-irec-react-query-client';
import { TableActionData } from '@energyweb/origin-ui-core';
import {
  useApiAllDemands,
  useApiRemoveDemandHandler,
  useCachedAllFuelTypes,
} from '@energyweb/origin-ui-exchange-data';
import { useDemandsTableLogic } from '@energyweb/origin-ui-exchange-logic';
import { Edit, Remove } from '@material-ui/icons';
import dayjs, { Dayjs } from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ExchangeModalsActionsEnum,
  useExchangeModalsDispatch,
} from '../../../context';
import {
  EndDateFilter,
  DemandPeriodFilter,
  StartDateFilter,
  DemandStatusFilter,
} from '../../table-filters';

export const useDemandsTableEffects = () => {
  const allFuelTypes = useCachedAllFuelTypes();
  const { allDemands, isLoading } = useApiAllDemands();

  const { t } = useTranslation();
  const dispatchModals = useExchangeModalsDispatch();

  const removeHandler = useApiRemoveDemandHandler();
  const openRemoveModal = (id: DemandDTO['id']) => {
    dispatchModals({
      type: ExchangeModalsActionsEnum.SHOW_REMOVE_ORDER_CONFIRM,
      payload: {
        open: true,
        id,
        removeHandler,
      },
    });
  };

  const openUpdateDemandModal = (id: DemandDTO['id']) => {
    const demandToUpdate = allDemands?.find((demand) => demand.id === id);
    dispatchModals({
      type: ExchangeModalsActionsEnum.SHOW_UPDATE_DEMAND,
      payload: {
        open: true,
        demand: demandToUpdate,
      },
    });
  };

  const actions: TableActionData<DemandDTO['id']>[] = [
    {
      name: t('exchange.myOrders.remove'),
      icon: <Remove />,
      onClick: (id: DemandDTO['id']) => openRemoveModal(id),
    },
    {
      name: t('exchange.myOrders.update'),
      icon: <Edit />,
      onClick: (id: DemandDTO['id']) => openUpdateDemandModal(id),
    },
  ];

  const tableFilters = [
    {
      name: 'period',
      filterFunc: (cellValue: TimeFrame, filterValue: TimeFrame) => {
        return cellValue === filterValue;
      },
      component: DemandPeriodFilter,
    },
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
      name: 'status',
      filterFunc: (cellValue: DemandStatus, filterValue: DemandStatus) => {
        return cellValue === filterValue;
      },
      component: DemandStatusFilter,
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

  const tableData = useDemandsTableLogic({
    demands: allDemands,
    isLoading,
    allFuelTypes,
    actions,
    tableFilters,
    openUpdateModal: openUpdateDemandModal,
  });

  return tableData;
};
