import { DemandDTO } from '@energyweb/exchange-irec-react-query-client';
import { TableActionData } from '@energyweb/origin-ui-core';
import {
  useApiAllDemands,
  useApiRemoveDemandHandler,
  useCachedAllFuelTypes,
} from '@energyweb/origin-ui-exchange-data';
import { useDemandsTableLogic } from '@energyweb/origin-ui-exchange-logic';
import { Edit, Remove } from '@material-ui/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ExchangeModalsActionsEnum,
  useExchangeModalsDispatch,
} from '../../../context';

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

  const tableData = useDemandsTableLogic({
    demands: allDemands,
    isLoading,
    allFuelTypes,
    actions,
    openUpdateModal: openUpdateDemandModal,
  });

  return tableData;
};
