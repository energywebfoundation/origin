import React, { PropsWithChildren, ReactElement } from 'react';
import { Control, Controller } from 'react-hook-form';
import { GenericFormField } from '../../../containers';
import { MaterialDatepicker } from '../MaterialDatepicker';

export interface FormDatePickerProps<FormValuesType> {
  field: GenericFormField;
  control: Control<FormValuesType>;
  errorExists: boolean;
  errorText: string;
  variant?: 'standard' | 'outlined' | 'filled';
  disabled: boolean;
}

export type TFormDatePicker = <FormValuesType>(
  props: PropsWithChildren<FormDatePickerProps<FormValuesType>>
) => ReactElement;

export const FormDatePicker: TFormDatePicker = ({
  field,
  control,
  errorExists,
  errorText,
  variant,
  disabled,
}) => {
  return (
    <Controller
      name={field.name as any}
      control={control}
      render={({ field: { value, onChange } }) => (
        <MaterialDatepicker
          value={value}
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
