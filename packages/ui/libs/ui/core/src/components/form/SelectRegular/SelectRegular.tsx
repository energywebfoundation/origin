import { BaseTextFieldProps, MenuItem, TextField } from '@material-ui/core';
import React, { FC } from 'react';
import { GenericFormField } from '../../../containers';
import { FormSelectOption } from '../FormSelect';

export interface SelectRegularProps {
  field: GenericFormField;
  errorExists: boolean;
  errorText: string;
  value: FormSelectOption['value'];
  onChange: (...event: any[]) => void;
  variant?: 'standard' | 'outlined' | 'filled';
  textFieldProps?: BaseTextFieldProps;
}

export const SelectRegular: FC<SelectRegularProps> = ({
  field,
  errorExists,
  errorText,
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