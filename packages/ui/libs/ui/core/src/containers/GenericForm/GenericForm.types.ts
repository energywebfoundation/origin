import { PropsWithChildren, ReactElement, ReactNode } from 'react';
import { FormInputProps, FormSelectOption } from '../../components';
import * as yup from 'yup';
import {
  TextFieldProps,
  BoxProps,
  ButtonProps,
  TypographyVariant,
} from '@material-ui/core';
import {
  DeepPartial,
  Path,
  UnpackNestedValue,
  UseFormReset,
  ValidationMode,
} from 'react-hook-form';
import { DatePickerProps } from '@material-ui/lab';

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
  dependentOn?: string;
  dependentOptionsCallback?: (fieldValue: any) => FormSelectOption[];
};

export type GenericFormSecondaryButton = ButtonProps & {
  label: string;
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
}

export type TGenericForm = <FormValuesType>(
  props: PropsWithChildren<GenericFormProps<FormValuesType>>
) => ReactElement;
