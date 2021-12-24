import { PropsWithChildren, ReactElement, ReactNode } from 'react';
import { FormInputProps, FormSelectOption } from '../../components';
import * as yup from 'yup';
import {
  TextFieldProps,
  InputBaseProps,
  BoxProps,
  ButtonProps,
  TypographyVariant,
} from '@mui/material';
import {
  DeepPartial,
  Path,
  UnpackNestedValue,
  UseFormReset,
  ValidationMode,
} from 'react-hook-form';
import { DatePickerProps } from '@mui/lab';

export type GenericFormField<FormValuesType> = {
  name: keyof FormValuesType;
  label: string;
  type?: 'text' | 'password' | 'number';
  placeholder?: string;
  required?: boolean;
  select?: boolean;
  additionalInputProps?: {
    valueToOpen: FormSelectOption['value'];
    name: string;
    label: string;
    required: boolean;
    inputProps?: InputBaseProps['inputProps'];
  };
  options?: FormSelectOption[];
  autocomplete?: boolean;
  multiple?: boolean;
  maxValues?: number;
  datePicker?: boolean;
  datePickerProps?: Omit<DatePickerProps, 'value' | 'onChange' | 'renderInput'>;
  startAdornment?: ReactNode;
  endAdornment?: {
    element: ReactNode;
    isValidCheck?: boolean;
  };
  textFieldProps?: TextFieldProps;
  inputProps?: InputBaseProps['inputProps'];
  dependentOn?: string;
  dependentOptionsCallback?: (fieldValue: any) => FormSelectOption[];
};

export type GenericFormSecondaryButton = ButtonProps & {
  label: string;
};

type GenericFormPrimaryButton = ButtonProps & {
  ['data-cy']: string;
};

export interface GenericFormProps<FormValuesType> {
  hideSubmitButton?: boolean;
  submitHandler: (
    values: UnpackNestedValue<FormValuesType>,
    resetForm: UseFormReset<FormValuesType>
  ) => void | Promise<void>;
  validationSchema: yup.AnyObjectSchema;
  initialValues: UnpackNestedValue<DeepPartial<FormValuesType>>;
  fields: GenericFormField<FormValuesType>[];
  buttonText: string;
  buttonFullWidth?: boolean;
  buttonProps?: GenericFormPrimaryButton;
  buttonWrapperProps?: BoxProps;
  buttonDisabled?: boolean;
  secondaryButtons?: GenericFormSecondaryButton[];
  formTitle?: string;
  formTitleVariant?: TypographyVariant;
  formClass?: string;
  inputsVariant?: FormInputProps<FormValuesType>['variant'];
  formInputsProps?: TextFieldProps;
  partOfMultiForm?: boolean;
  twoColumns?: boolean;
  inputsToWatch?: Path<FormValuesType>[];
  onWatchHandler?: (watchedValues: unknown[]) => void;
  validationMode?: keyof ValidationMode;
  loading?: boolean;
  acceptInitialValues?: boolean;
  formDisabled?: boolean;
}

export type TGenericForm = <FormValuesType>(
  props: PropsWithChildren<GenericFormProps<FormValuesType>>
) => ReactElement;
