import { TextFieldProps } from '@material-ui/core';
import React, { PropsWithChildren, ReactElement } from 'react';
import { Dayjs } from 'dayjs';
import { Control, Controller } from 'react-hook-form';
import { MaterialDatepicker } from '../MaterialDatepicker';

export type DatePickerField<FormValuesType> = {
  name: keyof FormValuesType;
  label: string;
  placeholder?: string;
  required?: boolean;
  textFieldProps?: TextFieldProps;
};

export interface FormDatePickerProps<FormValuesType> {
  field: DatePickerField<FormValuesType>;
  control: Control<FormValuesType>;
  errorExists?: boolean;
  errorText?: string;
  variant?: 'standard' | 'outlined' | 'filled';
  disabled?: boolean;
}

export type TFormDatePicker = <FormValuesType>(
  props: PropsWithChildren<FormDatePickerProps<FormValuesType>>
) => ReactElement;

export const FormDatePicker: TFormDatePicker = ({
  field,
  control,
  errorExists = false,
  errorText = '',
  variant = 'outlined',
  disabled = false,
}) => {
  return (
    <Controller
      name={field.name as any}
      control={control}
      render={({ field: { value, onChange } }) => (
        <MaterialDatepicker
          value={value as Dayjs}
          onChange={onChange}
          field={field}
          errorExists={errorExists}
          errorText={errorText}
          variant={variant}
          disabled={disabled}
        />
      )}
    />
  );
};
