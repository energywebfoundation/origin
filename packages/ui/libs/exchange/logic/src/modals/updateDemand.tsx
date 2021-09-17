import {
  DemandDTO,
  TimeFrame,
} from '@energyweb/exchange-irec-react-query-client';
import { GenericFormProps } from '@energyweb/origin-ui-core';
import { EnergyFormatter } from '@energyweb/origin-ui-utils';
import React from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { periodTypeOptions } from '../utils';

export type TUpdateDemandFormValues = {
  period: TimeFrame;
  startDate: Date;
  endDate: Date;
  volume: number;
  price: number;
};

type TUseUpdateDemandFormLogic = (
  demand: DemandDTO,
  onWatchHandler: (values: any) => void
) => Omit<GenericFormProps<TUpdateDemandFormValues>, 'submitHandler'>;

export const useUpdateDemandFormLogic: TUseUpdateDemandFormLogic = (
  demand,
  onWatchHandler
) => {
  const { t } = useTranslation();

  const initialFormData = {
    period: demand?.periodTimeFrame,
    startDate: demand?.start,
    endDate: demand?.end,
    volume: parseInt(EnergyFormatter.format(demand?.volumePerPeriod || '0')),
    price: demand?.price / 100,
  };

  return {
    initialValues: initialFormData,
    fields: [
      {
        name: 'period',
        label: t('exchange.myOrders.period'),
        select: true,
        options: periodTypeOptions(t, false),
      },
      {
        name: 'startDate',
        label: t('exchange.myOrders.startDate'),
        datePicker: true,
      },
      {
        name: 'endDate',
        label: t('exchange.myOrders.endDate'),
        datePicker: true,
      },
      {
        name: 'volume',
        label: t('exchange.myOrders.volume'),
        endAdornment: {
          element: <>MWh</>,
        },
        textFieldProps: {
          type: 'number',
        },
      },
      {
        name: 'price',
        label: t('exchange.myOrders.price'),
        endAdornment: {
          element: <>USD</>,
        },
      },
    ],
    inputsToWatch: ['period', 'startDate', 'endDate', 'volume'],
    onWatchHandler,
    inputsVariant: 'filled',
    buttonText: t('general.buttons.update'),
    validationSchema: yup.object({
      period: yup.string().label(t('exchange.myOrders.period')),
      startDate: yup.string().label(t('exchange.myOrders.startDate')),
      endDate: yup.string().label(t('exchange.myOrders.endDate')),
      volume: yup
        .number()
        .min(1)
        .required()
        .label(t('exchange.myOrders.volume')),
      price: yup
        .number()
        .transform((value) => (isNaN(value) ? 0 : value))
        .min(0.5)
        .required()
        .label(t('exchange.myOrders.price')),
    }),
  };
};
