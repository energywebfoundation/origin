import React, { PropsWithChildren, ReactElement } from 'react';
import AdapterDayJs from '@material-ui/lab/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@material-ui/lab';
import { Control, Controller } from 'react-hook-form';
import { GenericFormField } from '../../../containers';
import { TextField } from '@material-ui/core';
import { DateFormatEnum } from '@energyweb/origin-ui-utils';

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
        <LocalizationProvider dateAdapter={AdapterDayJs}>
          <DatePicker
            disabled={disabled}
            onChange={onChange}
            value={value}
            inputFormat={DateFormatEnum.DATE_FORMAT_DMY}
            renderInput={(props) => (
              <TextField
                {...props}
                fullWidth
                margin="normal"
                error={errorExists ?? false}
                helperText={errorText ?? ''}
                variant={variant}
                label={field.label}
                {...field.textFieldProps}
              />
            )}
          />
        </LocalizationProvider>
      )}
    />
  );
};
