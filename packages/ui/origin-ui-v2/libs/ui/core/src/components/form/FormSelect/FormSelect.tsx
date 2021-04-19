import { BaseTextFieldProps } from '@material-ui/core';
import React, { FC } from 'react';
import { Control, Controller } from 'react-hook-form';
import { GenericFormField } from '../../../containers/GenericForm';
import { SelectAutocomplete } from '../SelectAutocomplete';
import { SelectRegular } from '../SelectRegular/SelectRegular';

export type FormSelectOption = {
  value: any;
  label: string;
};

export interface FormSelectProps extends BaseTextFieldProps {
  field: GenericFormField;
  control: Control<any>;
  errorExists: boolean;
  errorText: string;
  variant?: 'standard' | 'outlined' | 'filled';
}

export const FormSelect: FC<FormSelectProps> = ({
  field,
  control,
  errorExists,
  errorText,
  variant,
  ...rest
}) => {
  return (
    <Controller
      name={field.name}
      control={control}
      render={({ field: { value, onChange } }) =>
        field.autocomplete ? (
          <SelectAutocomplete
            label={field.label}
            options={field.options}
            onChange={onChange}
            value={value}
            multiple={field.multiple}
            maxValues={field.maxValues}
          />
        ) : (
          <SelectRegular
            field={field}
            errorExists={errorExists}
            errorText={errorText}
            value={value}
            onChange={onChange}
            variant={variant}
            {...rest}
          />
        )
      }
    />
  );
};
