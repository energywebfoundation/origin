import { OrderSide } from '@energyweb/exchange-irec-react-query-client';
import { GenericModalProps } from '@energyweb/origin-ui-core';
import {
  useApiCancelOrderHandler,
  useCachedAllDevices,
  useCachedAllFuelTypes,
} from '@energyweb/origin-ui-exchange-data';
import { useOrderDetailsLogic } from '@energyweb/origin-ui-exchange-logic';
import { useTranslation } from 'react-i18next';
import {
  ExchangeModalsActionsEnum,
  useExchangeModalsDispatch,
  useExchangeModalsStore,
} from '../../../context';

export const useOrderDetailsEffects = () => {
  const { t } = useTranslation();

  const { orderDetails } = useExchangeModalsStore();
  const dispatchModals = useExchangeModalsDispatch();
  const { open, order } = orderDetails;

  const handleClose = () => {
    dispatchModals({
      type: ExchangeModalsActionsEnum.SHOW_ORDER_DETAILS,
      payload: {
        open: false,
        order: null,
      },
    });
  };

  const orderSideText =
    order?.side === OrderSide.Bid
      ? t('exchange.myOrders.bid')
      : t('exchange.myOrders.ask');
  const removeHandler = useApiCancelOrderHandler(orderSideText);

  const handleRemove = () => {
    dispatchModals({
      type: ExchangeModalsActionsEnum.SHOW_REMOVE_ORDER_CONFIRM,
      payload: {
        open: false,
        id: order?.id,
        removeHandler,
      },
    });
  };

  const allFuelTypes = useCachedAllFuelTypes();
  const allDevices = useCachedAllDevices();
  const modalFields = useOrderDetailsLogic(order, allFuelTypes, allDevices);

  const genericModalProps: GenericModalProps = {
    open,
    closeButton: true,
    handleClose,
    dialogProps: { maxWidth: 'sm' },
    title: ' ',
    buttons: [
      {
        label: t('exchange.myOrders.remove'),
        onClick: handleRemove,
      },
    ],
  };

  const fieldLabels = {
    orderIdLabel: t('exchange.myOrders.orderNo'),
    fuelTypeLabel: t('exchange.myOrders.fuelType'),
    gridOperatorLabel: t('exchange.myOrders.gridOperator'),
    regionLabel: t('exchange.myOrders.region'),
    filledLabel: t('exchange.myOrders.filled'),
  };

  return { genericModalProps, modalFields, fieldLabels };
};
