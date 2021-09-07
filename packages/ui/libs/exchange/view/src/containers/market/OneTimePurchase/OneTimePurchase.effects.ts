import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOneTimePurchaseFormLogic } from '@energyweb/origin-ui-exchange-logic';
import { useApiCreateBidHandler } from '@energyweb/origin-ui-exchange-data';
import {
  MarketFilterActionEnum,
  MarketFiltersActions,
  MarketFiltersState,
} from '../../../reducer';
import { Dayjs } from 'dayjs';
import { Dispatch } from 'react';
import { useMediaQuery, useTheme } from '@material-ui/core';
import { MarketButton } from '../TotalAndButtons';

type BidFormValues = {
  energy: number;
  price: number;
};

export const useOneTimePurchaseEffects = (
  filters: MarketFiltersState,
  dispatch: Dispatch<MarketFiltersActions>
) => {
  const theme = useTheme();
  const mobileView = useMediaQuery(theme.breakpoints.down('sm'));
  const {
    initialValues,
    validationSchema,
    fields,
    buttons,
  } = useOneTimePurchaseFormLogic(mobileView);

  const handleGenerationFromChange = (event: Dayjs) => {
    dispatch({
      type: MarketFilterActionEnum.SET_GENERATION_FROM,
      payload: event,
    });
  };

  const handleGenerationToChange = (event: Dayjs) => {
    dispatch({
      type: MarketFilterActionEnum.SET_GENERATION_TO,
      payload: event,
    });
  };

  const {
    register,
    formState,
    handleSubmit,
    reset,
    watch,
  } = useForm<BidFormValues>({
    mode: 'onChange',
    resolver: yupResolver(validationSchema),
    defaultValues: initialValues,
  });

  const resetGenerationDates = () => {
    handleGenerationFromChange(null);
    handleGenerationToChange(null);
  };

  const resetForm = () => {
    resetGenerationDates();
    reset();
  };

  const createBidHandler = useApiCreateBidHandler(filters, resetForm);

  const onSubmit = handleSubmit(async (values) => {
    await createBidHandler(values);
  });

  const { price, energy } = watch();
  const totalPrice = (price * energy).toFixed(2).toString();

  const { isValid, errors, isDirty, dirtyFields, isSubmitting } = formState;

  const buttonDisabled = !isValid || !isDirty || isSubmitting;
  const buttonWithState: MarketButton[] = buttons?.map((button) => ({
    ...button,
    onClick: onSubmit,
    buttonProps: {
      ...button.buttonProps,
      disabled: buttonDisabled,
    },
  }));

  return {
    handleGenerationFromChange,
    handleGenerationToChange,
    register,
    fields,
    buttons: buttonWithState,
    errors,
    dirtyFields,
    totalPrice,
  };
};
