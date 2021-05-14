import React, { FC, memo } from 'react';
import {
  InputAdornment,
  BaseTextFieldProps,
  TextField,
} from '@material-ui/core';
import { GenericFormField } from '../../../containers';
import { UseFormRegister, FieldValues } from 'react-hook-form';

export type FormInputField = Omit<
  GenericFormField,
  'options' | 'select' | 'autocomplete' | 'multiple' | 'maxValues'
>;

export interface FormInputProps extends BaseTextFieldProps {
  field: FormInputField;
  register: UseFormRegister<FieldValues>;
  errorExists: boolean;
  errorText: string;
  isDirty: boolean;
  variant?: 'standard' | 'outlined' | 'filled';
  disable: boolean;
}

export const FormInput: FC<FormInputProps> = memo(
  ({ field, register, errorExists, errorText, isDirty, variant, ...rest }) => {
    const { ref, name, onBlur, onChange } = register(field.name);
    const showEndAdornment = field.endAdornment?.isValidCheck
      ? !errorExists && isDirty
      : true;

    return (
      <TextField
        name={name ?? ''}
        disabled={field.disabled}
        label={field.label ?? ''}
        type={field.type ?? 'text'}
        inputRef={ref}
        error={errorExists ?? false}
        helperText={errorText ?? ''}
        fullWidth
        margin="normal"
        variant={variant ?? 'standard'}
        InputProps={{
          startAdornment: field.startAdornment && (
            <InputAdornment position="start">
              {field.startAdornment}
            </InputAdornment>
          ),
          endAdornment: field.endAdornment?.element && showEndAdornment && (
            <InputAdornment position="end">
              {field.endAdornment?.element}
            </InputAdornment>
          ),
        }}
        onChange={onChange}
        onBlur={onBlur}
        {...rest}
      />
    );
  }
);
