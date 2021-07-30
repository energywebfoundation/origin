import { TextFieldProps, MenuItem, TextField } from '@material-ui/core';
import React, { FC } from 'react';
import { GenericFormField } from '../../../containers';
import { FormSelectOption } from '../FormSelect';

export interface SelectRegularProps {
  field: GenericFormField;
  errorExists?: boolean;
  errorText?: string;
  value: FormSelectOption['value'];
  onChange: (...event: any[]) => void;
  variant?: 'standard' | 'outlined' | 'filled';
  textFieldProps?: TextFieldProps;
}

export const SelectRegular: FC<SelectRegularProps> = ({
  field,
  errorExists = false,
  errorText = '',
  variant,
  value,
  onChange,
  textFieldProps,
}) => {
  return (
    <TextField
      disabled={field.frozen}
      select
      name={field.name}
      label={field.label}
      type={field.name}
      error={errorExists}
      helperText={errorText}
      fullWidth
      margin="normal"
      variant={variant ?? 'standard'}
      value={value ?? ''}
      defaultValue={value}
      onChange={onChange}
      required={field.required}
      {...textFieldProps}
    >
      {field.options.map((option) => (
        <MenuItem key={option.label} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
};
