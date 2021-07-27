import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

export const useOneTimePurchaseFormLogic = () => {
  const { t } = useTranslation();

  return {
    initialValues: {
      generationFrom: null,
      generationTo: null,
      energy: null,
      price: null,
    },
    validationSchema: yup.object({
      energy: yup
        .number()
        .transform((value) => (isNaN(value) ? 0 : value))
        .min(1)
        .required()
        .label(t('exchange.viewMarket.energy')),
      price: yup
        .number()
        .transform((value) => (isNaN(value) ? 0 : value))
        .min(0.1)
        .required()
        .label(t('exchange.viewMarket.price')),
    }),
    fields: {
      generationFrom: {
        name: 'generationFrom',
        label: t('exchange.viewMarket.generationFrom'),
        textFieldProps: { variant: 'filled' as any },
      },
      generationTo: {
        name: 'generationTo',
        label: t('exchange.viewMarket.generationTo'),
        textFieldProps: { variant: 'filled' as any },
      },
      energy: {
        name: 'energy',
        label: t('exchange.viewMarket.energy'),
      },
      price: {
        name: 'price',
        label: t('exchange.viewMarket.price'),
      },
    },
    buttons: [
      {
        label: t('exchange.viewMarket.placeBidButton'),
        buttonProps: {
          variant: 'contained' as any,
        },
      },
    ],
  };
};
