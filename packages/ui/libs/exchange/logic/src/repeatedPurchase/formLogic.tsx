import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { periodTypeOptions } from '../utils';
import React from 'react';
import { TimeFrame } from '@energyweb/utils-general';

export const useRepeatedPurchaseFormLogic = () => {
  const { t } = useTranslation();

  return {
    initialValues: {
      period: TimeFrame.Daily,
      volume: null,
      startDate: null,
      endDate: null,
      price: null,
    },
    validationSchema: yup.object({
      volume: yup
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
      period: {
        name: 'period',
        options: periodTypeOptions(t, true),
        label: t('exchange.viewMarket.period'),
        textFieldProps: { variant: 'filled' as any },
      },
      volume: {
        name: 'volume',
        label: t('exchange.viewMarket.volume'),
        endAdornment: {
          element: <>{'MWh'}</>,
        },
      },
      startDate: {
        name: 'startDate',
        label: t('exchange.viewMarket.demandStartDate'),
        textFieldProps: { variant: 'filled' as any },
      },
      endDate: {
        name: 'endDate',
        label: t('exchange.viewMarket.demandEndDate'),
        textFieldProps: { variant: 'filled' as any },
      },
      totalVolume: {
        name: 'totalVolume',
        label: t('exchange.viewMarket.totalVolume'),
      },
      price: {
        name: 'price',
        label: t('exchange.viewMarket.price'),
        endAdornment: {
          element: <>{'USD'}</>,
        },
      },
    },
    buttons: [
      {
        label: t('exchange.viewMarket.placeDemandButton'),
        buttonProps: {
          variant: 'contained' as any,
        },
      },
    ],
  };
};
