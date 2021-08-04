import { DateFormatEnum } from '@energyweb/origin-ui-utils';
import { TextField, TextFieldProps } from '@material-ui/core';
import { DatePicker, LocalizationProvider } from '@material-ui/lab';
import AdapterDayJs from '@material-ui/lab/AdapterDayjs';
import { Dayjs } from 'dayjs';
import React, { FC } from 'react';
import { GenericFormField } from '../../../containers';

export interface MaterialDatepickerProps {
  value: any;
  onChange: (event: Dayjs) => void;
  field: GenericFormField;
  disabled?: boolean;
  errorExists?: boolean;
  errorText?: string;
  variant?: TextFieldProps['variant'];
}

export const MaterialDatepicker: FC<MaterialDatepickerProps> = ({
  value,
  onChange,
  disabled,
  errorExists,
  errorText,
  variant,
  field,
}) => {
  return (
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
            required={field.required}
            {...field.textFieldProps}
          />
        )}
      />
    </LocalizationProvider>
  );
};
