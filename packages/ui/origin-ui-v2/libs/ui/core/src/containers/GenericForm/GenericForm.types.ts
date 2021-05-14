import * as yup from 'yup';
import { PropsWithChildren, ReactElement, ReactNode } from 'react';
import { FormInputProps, FormSelectOption } from '../../components';
import { BoxProps, TypographyVariant } from '@material-ui/core';
import { DeepPartial, UnpackNestedValue } from 'react-hook-form';

export type GenericFormField = {
  disabled?: boolean;
  name: string;
  label: string;
  type?: string;
  select?: boolean;
  options?: FormSelectOption[];
  autocomplete?: boolean;
  multiple?: boolean;
  maxValues?: number;
  startAdornment?: ReactNode;
  endAdornment?: {
    element: ReactNode;
    isValidCheck?: boolean;
  };
};

export interface GenericFormProps<FormValuesType> {
  submitHandler: (values: UnpackNestedValue<FormValuesType>) => void;
  validationSchema: yup.ObjectSchema<any>;
  initialValues: UnpackNestedValue<DeepPartial<FormValuesType>>;
  fields: GenericFormField[];
  buttonText: string;
  buttonFullWidth?: boolean;
  buttonWrapperProps?: BoxProps;
  formTitle?: string;
  formTitleVariant?: TypographyVariant;
  formClass?: string;
  inputsVariant?: FormInputProps['variant'];
  inputsClass?: string;
  partOfMultiForm?: boolean;
  twoColumns?: boolean;
  processing?: boolean;
  editDisabled?: boolean;
}

export type TGenericForm = <FormValuesType>(
  props: PropsWithChildren<GenericFormProps<FormValuesType>>
) => ReactElement;
