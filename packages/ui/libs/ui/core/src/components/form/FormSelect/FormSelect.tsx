import { TextFieldProps } from '@material-ui/core';
import React, { PropsWithChildren, ReactElement } from 'react';
import {
  Control,
  Controller,
  UseFormRegister,
  useWatch,
} from 'react-hook-form';
import { SelectAutocomplete } from '../SelectAutocomplete';
import { SelectRegular } from '../SelectRegular';

type FormSelectField<FormValuesType> = {
  name: keyof FormValuesType;
  label: string;
  placeholder?: string;
  required?: boolean;
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
  textFieldProps?: TextFieldProps;
  dependentOn?: string;
  dependentOptionsCallback?: (fieldValue: any) => FormSelectOption[];
};

export type FormSelectOption = {
  value: string | number;
  label: string;
};

export interface FormSelectProps<FormValuesType> {
  field: FormSelectField<FormValuesType>;
  control: Control<FormValuesType>;
  errorExists?: boolean;
  errorText?: string;
  variant?: 'standard' | 'outlined' | 'filled';
  disabled?: boolean;
  register?: UseFormRegister<FormValuesType>;
}

export type TFormSelect = <FormValuesType>(
  props: PropsWithChildren<FormSelectProps<FormValuesType>>
) => ReactElement;

export const FormSelect: TFormSelect = ({
  field,
  control,
  errorExists = false,
  errorText = '',
  variant = 'filled',
  disabled = false,
  register = null,
}) => {
  const watchedValue = useWatch({
    name: field.dependentOn as any,
    control,
  });
  const dependentValue = field.dependentOn ? watchedValue : undefined;

  return (
    <Controller
      name={field.name as any}
      control={control}
      render={({ field: { value, onChange } }) => {
        return field.autocomplete ? (
          <SelectAutocomplete
            value={value as FormSelectOption[]}
            field={field}
            onChange={onChange}
            errorExists={errorExists}
            errorText={errorText}
            variant={variant}
            dependentValue={dependentValue as any}
            disabled={disabled}
          />
        ) : (
          <SelectRegular
            field={field}
            errorExists={errorExists}
            errorText={errorText}
            value={value as FormSelectOption['value']}
            onChange={onChange}
            variant={variant}
            disabled={disabled}
            register={register}
          />
        );
      }}
    />
  );
};
