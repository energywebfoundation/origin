import { OrderBookOrderDTO } from '@energyweb/exchange-irec-react-query-client';
import { GenericFormProps } from '@energyweb/origin-ui-core';
import { BuyDirectFormValues } from '@energyweb/origin-ui-exchange-data';
import { PowerFormatter } from '@energyweb/origin-ui-utils';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

export type TUseBuyDirectFormLogic = (
  handleClose: () => void,
  ask: OrderBookOrderDTO
) => Omit<GenericFormProps<BuyDirectFormValues>, 'submitHandler'>;

export const useBuyDirectFormLogic: TUseBuyDirectFormLogic = (
  handleClose,
  ask
) => {
  const { t } = useTranslation();

  const initialFormData = {
    volume: PowerFormatter.format(parseInt(ask?.volume)),
  };

  return {
    formTitle: t('exchange.viewMarket.modals.buyDirect.title'),
    formTitleVariant: 'h5',
    initialValues: initialFormData,
    fields: [
      {
        name: 'volume',
        label: t('exchange.viewMarket.volume'),
      },
    ],
    inputsVariant: 'filled',
    secondaryButtons: [
      {
        variant: 'outlined',
        style: { marginRight: 20 },
        label: t('general.buttons.cancel'),
        onClick: handleClose,
      },
    ],
    buttonText: t('exchange.viewMarket.modals.buyDirect.buy'),
    validationSchema: yup.object({
      volume: yup.string().label(t('exchange.viewMarket.volume')),
    }),
  };
};
