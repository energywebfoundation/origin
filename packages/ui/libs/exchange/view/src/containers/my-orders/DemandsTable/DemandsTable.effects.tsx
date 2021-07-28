import { DemandDTO } from '@energyweb/exchange-irec-react-query-client';
import { TableActionData } from '@energyweb/origin-ui-core';
import {
  useApiAllDemands,
  useApiRemoveDemandHandler,
  useCachedAllFuelTypes,
} from '@energyweb/origin-ui-exchange-data';
import { useDemandsTableLogic } from '@energyweb/origin-ui-exchange-logic';
import { Remove } from '@material-ui/icons';
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

  const actions: TableActionData<DemandDTO['id']>[] = [
    {
      name: t('exchange.myOrders.remove'),
      icon: <Remove />,
      onClick: (id: DemandDTO['id']) => openRemoveModal(id),
    },
  ];

  const tableData = useDemandsTableLogic({
    demands: allDemands,
    isLoading,
    allFuelTypes,
    actions,
  });

  return tableData;
};
