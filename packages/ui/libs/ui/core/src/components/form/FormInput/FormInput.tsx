import React, { memo, PropsWithChildren, ReactElement } from 'react';
import {
  InputAdornment,
  BaseTextFieldProps,
  TextField,
} from '@material-ui/core';
import { GenericFormField } from '../../../containers';
import { UseFormRegister } from 'react-hook-form';

export type FormInputField = Omit<
  GenericFormField,
  'options' | 'select' | 'autocomplete' | 'multiple' | 'maxValues'
> &
  BaseTextFieldProps;

export interface FormInputProps<FormValues> extends BaseTextFieldProps {
  field: FormInputField;
  register: UseFormRegister<FormValues>;
  errorExists: boolean;
  errorText: string;
  isDirty: boolean;
  disabled: boolean;
  variant?: 'standard' | 'outlined' | 'filled';
}

export type TFormInput = <FormValuesType>(
  props: PropsWithChildren<FormInputProps<FormValuesType>>
) => ReactElement;

export const FormInput: TFormInput = memo(
  ({
    field,
    register,
    errorExists,
    errorText,
    isDirty,
    variant,
    disabled,
    ...rest
  }) => {
    const { ref, name, onBlur, onChange } = register(field.name as any);
    const showEndAdornment = field.endAdornment?.isValidCheck
      ? !errorExists && isDirty
      : true;

    return (
      <TextField
        name={name ?? ''}
        disabled={disabled}
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
        {...field.textFieldProps}
        {...rest}
      />
    );
  }
);
