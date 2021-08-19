import React, { memo, PropsWithChildren, ReactElement, ReactNode } from 'react';
import { InputAdornment, TextField, TextFieldProps } from '@material-ui/core';
import { UseFormRegister } from 'react-hook-form';

export type FormInputField<FormValuesType> = {
  name: keyof FormValuesType;
  label: string;
  type?: 'text' | 'password' | 'number';
  placeholder?: string;
  required?: boolean;
  startAdornment?: ReactNode;
  endAdornment?: {
    element: ReactNode;
    isValidCheck?: boolean;
  };
  textFieldProps?: TextFieldProps;
};

export interface FormInputProps<FormValues> {
  field: FormInputField<FormValues>;
  register: UseFormRegister<FormValues>;
  errorExists?: boolean;
  errorText?: string;
  isDirty?: boolean;
  disabled?: boolean;
  variant?: 'standard' | 'outlined' | 'filled';
}

export type TFormInput = <FormValuesType>(
  props: PropsWithChildren<FormInputProps<FormValuesType>>
) => ReactElement;

export const FormInput: TFormInput = memo(
  ({
    field,
    register,
    errorExists = false,
    errorText = '',
    isDirty = true,
    variant = 'standard',
    disabled = false,
  }) => {
    const { ref, name, onBlur, onChange } = register(field.name as any);
    const showEndAdornment = field.endAdornment?.isValidCheck
      ? !errorExists && isDirty
      : true;

    return (
      <TextField
        fullWidth
        margin="normal"
        name={name ?? ''}
        disabled={disabled}
        label={field.label ?? ''}
        type={field.type ?? 'text'}
        inputRef={ref}
        error={errorExists}
        helperText={errorText}
        required={field.required}
        variant={variant}
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
      />
    );
  }
);
