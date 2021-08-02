import { TextFieldProps, MenuItem, TextField } from '@material-ui/core';
import React, { PropsWithChildren, ReactElement } from 'react';
import { UseFormRegister } from 'react-hook-form';
import { GenericFormField } from '../../../containers';
import { FormSelectOption } from '../FormSelect';

export interface SelectRegularProps<FormValuesType = any> {
  field: GenericFormField;
  value: FormSelectOption['value'];
  onChange: (...event: any[]) => void;
  register?: UseFormRegister<FormValuesType>;
  errorExists?: boolean;
  errorText?: string;
  variant?: 'standard' | 'outlined' | 'filled';
  textFieldProps?: TextFieldProps;
}

export type TSelectRegular = <FormValuesType>(
  props: PropsWithChildren<SelectRegularProps<FormValuesType>>
) => ReactElement;

export const SelectRegular: TSelectRegular = ({
  field,
  errorExists = false,
  errorText = '',
  variant,
  value,
  register,
  onChange,
  textFieldProps,
}) => {
  const additionalInputRegistration =
    field?.additionalInputProps?.name &&
    register(field.additionalInputProps.name as any);
  return (
    <>
      <TextField
        select
        fullWidth
        name={field.name}
        label={field.label}
        type={field.name}
        error={errorExists}
        helperText={errorText}
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
      {field?.additionalInputProps?.valueToOpen === value && (
        <TextField
          fullWidth
          variant={variant ?? 'standard'}
          label={field.additionalInputProps.label}
          name={additionalInputRegistration?.name}
          inputRef={additionalInputRegistration?.ref}
          onChange={additionalInputRegistration?.onChange}
          onBlur={additionalInputRegistration?.onBlur}
          {...textFieldProps}
        />
      )}
    </>
  );
};
