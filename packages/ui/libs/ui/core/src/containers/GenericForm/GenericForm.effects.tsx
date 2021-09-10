import { FormEventHandler, useEffect } from 'react';
import {
  DeepMap,
  FieldError,
  useForm,
  UseFormRegister,
  Control,
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { GenericFormProps } from './GenericForm.types';

type GenericFormEffectsProps<FormValuesType> = Pick<
  GenericFormProps<FormValuesType>,
  | 'validationSchema'
  | 'initialValues'
  | 'submitHandler'
  | 'partOfMultiForm'
  | 'inputsToWatch'
  | 'onWatchHandler'
  | 'buttonDisabled'
  | 'validationMode'
  | 'acceptInitialValues'
>;

type GenericFormEffectsReturnType<FormValuesType> = {
  register: UseFormRegister<FormValuesType>;
  onSubmit: FormEventHandler<HTMLFormElement>;
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
  validationMode,
  acceptInitialValues,
}) => {
  const { control, register, handleSubmit, formState, reset, watch } = useForm({
    mode: validationMode,
    resolver: yupResolver(validationSchema),
    defaultValues: initialValues,
  });
  const { isValid, errors, dirtyFields, isDirty } = formState;

  const watchedFields =
    inputsToWatch && inputsToWatch.length > 0 ? watch(inputsToWatch) : [];

  const stringifiedWatchedFields = JSON.stringify(watchedFields);

  useEffect(() => {
    onWatchHandler && onWatchHandler(watchedFields);
  }, [stringifiedWatchedFields]);

  const onSubmit = handleSubmit(async (values) => {
    await submitHandler(values, reset);
  });

  const nextForm =
    initialValues && Object.keys(initialValues)[0] in dirtyFields;
  const submitButtonDisabled =
    buttonDisabled || partOfMultiForm
      ? !(nextForm && isValid)
      : acceptInitialValues
      ? false
      : !isDirty;

  return {
    control,
    register,
    onSubmit,
    errors,
    submitButtonDisabled,
    dirtyFields,
  };
};
