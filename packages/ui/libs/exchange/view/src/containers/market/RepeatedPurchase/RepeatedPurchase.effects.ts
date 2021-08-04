import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRepeatedPurchaseFormLogic } from '@energyweb/origin-ui-exchange-logic';
import { useApiCreateDemandHandler } from '@energyweb/origin-ui-exchange-data';
import { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { calculateDemandTotalVolume } from '@energyweb/origin-ui-exchange-data';
import { TimeFrame } from '@energyweb/utils-general';
import { useMediaQuery, useTheme } from '@material-ui/core';
import { MarketFiltersState } from '../../../pages';

type DemandFormValues = {
  period: TimeFrame;
  volume: number;
  startDate: Dayjs;
  endDate: Dayjs;
  price: number;
};

export const useRepeatedPurchaseEffects = (filters: MarketFiltersState) => {
  const theme = useTheme();
  const mobileView = useMediaQuery(theme.breakpoints.down('sm'));
  const { initialValues, validationSchema, fields, buttons } =
    useRepeatedPurchaseFormLogic(mobileView);

  const { register, control, formState, handleSubmit, watch, reset } =
    useForm<DemandFormValues>({
      mode: 'onChange',
      resolver: yupResolver(validationSchema),
      defaultValues: initialValues,
    });
  const createDemandHandler = useApiCreateDemandHandler(filters, reset);

  const values = watch();
  const [totalVolume, setTotalVolume] = useState('');
  const totalPrice = (Number(totalVolume) * values.price).toFixed(2).toString();
  useEffect(() => {
    const getAndSetTotalVolume = async () => {
      const { period, volume, startDate, endDate } = values;
      const newTotal = await calculateDemandTotalVolume({
        period,
        volume,
        startDate,
        endDate,
      });
      setTotalVolume(newTotal);
    };
    getAndSetTotalVolume();
  }, [values.period, values.volume, values.startDate, values.endDate]);

  const onSubmit = handleSubmit(async (values) => {
    await createDemandHandler(values);
  });

  const { isValid, errors, isDirty, dirtyFields } = formState;

  const buttonDisabled = !isValid || !isDirty;
  const buttonWithState = buttons?.map((button) => ({
    ...button,
    onClick: onSubmit,
    buttonProps: {
      ...button.buttonProps,
      disabled: buttonDisabled,
    },
  }));

  return {
    register,
    control,
    fields,
    buttons: buttonWithState,
    errors,
    dirtyFields,
    totalVolume,
    totalPrice,
    mobileView,
  };
};
