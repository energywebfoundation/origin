import {
  DeepMap,
  FieldError,
  useForm,
  UseFormRegister,
  Control,
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { GenericFormProps } from './GenericForm';

type GenericFormEffectsProps = Pick<
  GenericFormProps,
  'validationSchema' | 'initialValues' | 'submitHandler' | 'partOfMultiForm'
>;

type GenericFormEffectsReturnType = {
  register: UseFormRegister<any>;
  onSubmit: (e?: React.BaseSyntheticEvent<object, any, any>) => Promise<void>;
  errors: DeepMap<any, FieldError>;
  buttonDisabled: boolean;
  dirtyFields: DeepMap<any, true>;
  control: Control<any>;
};

type TGenericFormEffects = (
  props: GenericFormEffectsProps
) => GenericFormEffectsReturnType;

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

  const onSubmit = handleSubmit((values) => submitHandler(values));

  const nextForm =
    initialValues && Object.keys(initialValues)[0] in dirtyFields;
  const buttonDisabled = partOfMultiForm ? !(nextForm && isValid) : !isValid;

  return { control, register, onSubmit, errors, buttonDisabled, dirtyFields };
};
