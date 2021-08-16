import React, { memo, PropsWithChildren, ReactElement } from 'react';
import {
  InputAdornment,
  BaseTextFieldProps,
  TextField,
} from '@material-ui/core';
import { UseFormRegister } from 'react-hook-form';
import { GenericFormField } from '../../../containers';

export type FormInputField<FormValuesType> = Omit<
  GenericFormField<FormValuesType>,
  'options' | 'select' | 'autocomplete' | 'multiple' | 'maxValues'
> &
  Omit<BaseTextFieldProps, 'name'>;

export interface FormInputProps<FormValues> extends BaseTextFieldProps {
  field: FormInputField<FormValues>;
  register: UseFormRegister<FormValues>;
  errorExists: boolean;
  errorText: string;
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
    errorExists,
    errorText,
    isDirty,
    variant,
    disabled = false,
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
        required={field.required}
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
