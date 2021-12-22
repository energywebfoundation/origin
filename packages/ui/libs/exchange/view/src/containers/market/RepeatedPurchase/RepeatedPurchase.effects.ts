import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  DemandFormValues,
  useRepeatedPurchaseFormLogic,
} from '@energyweb/origin-ui-exchange-logic';
import { useApiCreateDemandHandler } from '@energyweb/origin-ui-exchange-data';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { calculateDemandTotalVolume } from '@energyweb/origin-ui-exchange-data';
import { useTheme } from '@mui/styles';
import { useMediaQuery } from '@mui/material';
import { MarketFiltersState } from '../../../reducer';
import { MarketButton } from '../TotalAndButtons';

export const useRepeatedPurchaseEffects = (filters: MarketFiltersState) => {
  const theme = useTheme();
  const mobileView = useMediaQuery(theme.breakpoints.down('sm'));
  const { initialValues, validationSchema, fields, buttons } =
    useRepeatedPurchaseFormLogic(mobileView);

  const { register, control, formState, handleSubmit, watch, reset } = useForm({
    mode: 'onChange',
    resolver: yupResolver(validationSchema) as any,
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
        startDate: startDate as Dayjs,
        endDate: endDate as Dayjs,
      });
      setTotalVolume(newTotal);
    };
    getAndSetTotalVolume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.period, values.volume, values.startDate, values.endDate]);

  const onSubmit = handleSubmit(async (values) => {
    await createDemandHandler(values as DemandFormValues);
  });

  const { isValid, errors, isDirty, dirtyFields, isSubmitting } = formState;

  const isValidDates =
    dayjs(values.startDate as Dayjs).isValid() &&
    dayjs(values.endDate as Dayjs).isValid();

  const onlyFuelTypeSpecified =
    filters.fuelType.length > 0 && filters.deviceType.length === 0;
  const buttonDisabled =
    !isValid ||
    !isDirty ||
    !isValidDates ||
    isSubmitting ||
    onlyFuelTypeSpecified;

  const buttonWithState: MarketButton[] = buttons?.map((button) => ({
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
