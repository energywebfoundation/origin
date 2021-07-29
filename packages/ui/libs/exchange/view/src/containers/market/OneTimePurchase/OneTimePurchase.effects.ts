import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOneTimePurchaseFormLogic } from '@energyweb/origin-ui-exchange-logic';
import { useApiCreateBidHandler } from '@energyweb/origin-ui-exchange-data';
import { MarketFiltersState } from '../../../pages';
import { Dayjs } from 'dayjs';

type BidFormValues = {
  generationFrom: Dayjs;
  generationTo: Dayjs;
  energy: number;
  price: number;
};

export const useOneTimePurchaseEffects = (filters: MarketFiltersState) => {
  const { initialValues, validationSchema, fields, buttons } =
    useOneTimePurchaseFormLogic();

  const { register, control, formState, handleSubmit, reset, watch } =
    useForm<BidFormValues>({
      mode: 'onChange',
      resolver: yupResolver(validationSchema),
      defaultValues: initialValues,
    });
  const createBidHandler = useApiCreateBidHandler(filters, reset);

  const onSubmit = handleSubmit(async (values) => {
    await createBidHandler(values);
  });

  const { price, energy } = watch();
  const totalPrice = (price * energy).toFixed(2).toString();

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
    totalPrice,
  };
};
