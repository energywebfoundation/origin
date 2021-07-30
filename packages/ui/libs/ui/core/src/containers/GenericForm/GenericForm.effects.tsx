import {
  DeepMap,
  FieldError,
  useForm,
  UseFormRegister,
  Control,
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { GenericFormProps } from './GenericForm.types';
import { BaseSyntheticEvent, useEffect } from 'react';

type GenericFormEffectsProps<FormValuesType> = Pick<
  GenericFormProps<FormValuesType>,
  | 'validationSchema'
  | 'initialValues'
  | 'submitHandler'
  | 'partOfMultiForm'
  | 'inputsToWatch'
  | 'onWatchHandler'
  | 'buttonDisabled'
>;

type GenericFormEffectsReturnType<FormValuesType> = {
  register: UseFormRegister<FormValuesType>;
  onSubmit: (e?: BaseSyntheticEvent<object, any, any>) => Promise<void>;
  errors: DeepMap<FormValuesType, FieldError>;
  submitButtonDisabled: boolean;
  dirtyFields: DeepMap<FormValuesType, true>;
  control: Control<FormValuesType>;
};

type TGenericFormEffects = <FormValuesType>(
  props: GenericFormEffectsProps<FormValuesType>
) => GenericFormEffectsReturnType<FormValuesType>;

export const useGenericFormEffects: TGenericFormEffects = ({
  validationSchema,
  initialValues,
  submitHandler,
  partOfMultiForm,
  inputsToWatch,
  onWatchHandler,
  buttonDisabled,
}) => {
  const { control, register, handleSubmit, formState, reset, watch } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(validationSchema),
    defaultValues: initialValues,
  });
  const { isValid, errors, dirtyFields, isDirty } = formState;

  const watchedFields =
    inputsToWatch && inputsToWatch.length > 0 ? watch(inputsToWatch) : [];
  useEffect(() => {
    onWatchHandler && onWatchHandler(watchedFields);
  }, [watchedFields]);

  const onSubmit = handleSubmit(async (values) => {
    await submitHandler(values, reset);
  });

  const nextForm =
    initialValues && Object.keys(initialValues)[0] in dirtyFields;
  const submitButtonDisabled =
    buttonDisabled || partOfMultiForm
      ? !(nextForm && isValid)
      : !isValid || !isDirty;

  return {
    control,
    register,
    onSubmit,
    errors,
    submitButtonDisabled,
    dirtyFields,
  };
};
