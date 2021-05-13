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
  'validationSchema' | 'initialValues' | 'submitHandler' | 'partOfMultiForm'
>;

type GenericFormEffectsReturnType<FormValuesType> = {
  register: UseFormRegister<FormValuesType>;
  onSubmit: (e?: React.BaseSyntheticEvent<object, any, any>) => Promise<void>;
  errors: DeepMap<FormValuesType, FieldError>;
  buttonDisabled: boolean;
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
}) => {
  const { control, register, handleSubmit, formState } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(validationSchema),
    defaultValues: initialValues,
  });
  const { isValid, errors, dirtyFields } = formState;

  const onSubmit = handleSubmit(async (values) => await submitHandler(values));

  const nextForm =
    initialValues && Object.keys(initialValues)[0] in dirtyFields;
  const buttonDisabled = partOfMultiForm ? !(nextForm && isValid) : !isValid;

  return { control, register, onSubmit, errors, buttonDisabled, dirtyFields };
};
