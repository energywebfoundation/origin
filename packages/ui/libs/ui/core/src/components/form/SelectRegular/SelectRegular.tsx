import { MenuItem, TextField, TextFieldProps } from '@material-ui/core';
import React, { PropsWithChildren, ReactElement } from 'react';
import { UseFormRegister } from 'react-hook-form';
import { isEmpty } from 'lodash';
import { FormSelectOption } from '../FormSelect';

export type SelectRegularField<FormValuesType> = {
  name: keyof FormValuesType;
  label: string;
  options?: FormSelectOption[];
  placeholder?: string;
  required?: boolean;
  additionalInputProps?: {
    valueToOpen: FormSelectOption['value'];
    name: string;
    label: string;
    required?: boolean;
  };
  textFieldProps?: TextFieldProps;
};

export interface SelectRegularProps<FormValuesType = any> {
  field: SelectRegularField<FormValuesType>;
  value: string | number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  errorExists?: boolean;
  errorText?: string;
  variant?: 'standard' | 'outlined' | 'filled';
  register?: UseFormRegister<FormValuesType>;
  disabled?: boolean;
}

export type TSelectRegular = <FormValuesType>(
  props: PropsWithChildren<SelectRegularProps<FormValuesType>>
) => ReactElement;

export const SelectRegular: TSelectRegular = ({
  field,
  onChange,
  errorExists = false,
  errorText = '',
  variant = 'standard',
  value = '',
  disabled = false,
  register = null,
}) => {
  const additionalInputRegistration =
    field.additionalInputProps?.name &&
    register &&
    register(field.additionalInputProps.name as any);
  const options = field.options || [];
  return (
    <>
      <TextField
        select
        fullWidth
        name={`${field.name}`}
        label={field.label}
        error={errorExists}
        helperText={errorText}
        margin="normal"
        variant={variant}
        value={value}
        defaultValue={value}
        onChange={onChange}
        disabled={disabled}
        required={field.required}
        {...field.textFieldProps}
      >
        {options.map((option) => (
          <MenuItem key={option.label} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      {!isEmpty(field.additionalInputProps) &&
        !!field.additionalInputProps?.valueToOpen &&
        field.additionalInputProps?.valueToOpen === value && (
          <TextField
            fullWidth
            variant={variant}
            label={field.additionalInputProps?.label}
            name={additionalInputRegistration?.name}
            inputRef={additionalInputRegistration?.ref}
            onChange={additionalInputRegistration?.onChange}
            onBlur={additionalInputRegistration?.onBlur}
            {...field.textFieldProps}
          />
        )}
    </>
  );
};
