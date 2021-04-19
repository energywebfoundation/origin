import { BaseTextFieldProps, MenuItem, TextField } from '@material-ui/core';
import React from 'react';
import { FC } from 'react';
import { GenericFormField } from '../../../containers';

interface SelectRegularProps extends BaseTextFieldProps {
  field: GenericFormField;
  errorExists: boolean;
  errorText: string;
  value: string | number;
  onChange: (...event: any[]) => void;
  variant?: 'standard' | 'outlined' | 'filled';
}

export const SelectRegular: FC<SelectRegularProps> = ({
  field,
  errorExists,
  errorText,
  variant,
  value,
  onChange,
  ...rest
}) => {
  return (
    <TextField
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
      {...rest}
    >
      {field.options.map((option) => (
        <MenuItem key={option.label} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
};
