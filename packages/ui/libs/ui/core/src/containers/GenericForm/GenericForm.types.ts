import { PropsWithChildren, ReactElement, ReactNode } from 'react';
import {
  FormInputProps,
  FormSelectOption,
  HierarchicalSelectOptions,
} from '../../components';
import * as yup from 'yup';
import {
  BaseTextFieldProps,
  BoxProps,
  TypographyVariant,
} from '@material-ui/core';
import { DeepPartial, UnpackNestedValue, UseFormReset } from 'react-hook-form';
import { DatePickerProps } from '@material-ui/lab';

export type GenericFormField = {
  name: string;
  label: string | null;
  type?: 'text' | 'password';
  frozen?: boolean;
  select?: boolean;
  options?: FormSelectOption[];
  autocomplete?: boolean;
  multiple?: boolean;
  maxValues?: number;
  hierarchical?: boolean;
  hierarchicalOptions?: HierarchicalSelectOptions;
  datePicker?: boolean;
  datePickerProps?: Omit<DatePickerProps, 'value' | 'onChange' | 'renderInput'>;
  startAdornment?: ReactNode;
  endAdornment?: {
    element: ReactNode;
    isValidCheck?: boolean;
  };
  textFieldProps?: BaseTextFieldProps;
};

export interface GenericFormProps<FormValuesType> {
  hideSubmitButton?: boolean;
  submitHandler: (
    values: UnpackNestedValue<FormValuesType>,
    resetForm: UseFormReset<FormValuesType>
  ) => void;
  validationSchema: yup.AnyObjectSchema;
  initialValues: UnpackNestedValue<DeepPartial<FormValuesType>>;
  fields: GenericFormField[];
  buttonText: string;
  buttonFullWidth?: boolean;
  buttonWrapperProps?: BoxProps;
  formTitle?: string;
  formTitleVariant?: TypographyVariant;
  formClass?: string;
  inputsVariant?: FormInputProps['variant'];
  formInputsProps?: BaseTextFieldProps;
  partOfMultiForm?: boolean;
  twoColumns?: boolean;
  processing?: boolean;
}

export type TGenericForm = <FormValuesType>(
  props: PropsWithChildren<GenericFormProps<FormValuesType>>
) => ReactElement;