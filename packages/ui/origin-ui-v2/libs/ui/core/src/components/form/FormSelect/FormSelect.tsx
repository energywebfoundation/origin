import React, { PropsWithChildren, ReactElement } from 'react';
import { Control, Controller } from 'react-hook-form';
import { GenericFormField } from '../../../containers';
import { SelectAutocomplete } from '../SelectAutocomplete';
import { SelectRegular } from '../SelectRegular/SelectRegular';

export type FormSelectOption = {
  value: string | number;
  label: string;
};

export interface FormSelectProps<FormValuesType> {
  field: GenericFormField;
  control: Control<FormValuesType>;
  errorExists: boolean;
  errorText: string;
  variant?: 'standard' | 'outlined' | 'filled';
  disable: boolean;
}

export type TFormSelect = <FormValuesType>(
  props: PropsWithChildren<FormSelectProps<FormValuesType>>
) => ReactElement;

export const FormSelect: TFormSelect = ({
  field,
  control,
  errorExists,
  errorText,
  variant,
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
            errorExists={errorExists}
            errorText={errorText}
            multiple={field.multiple}
            maxValues={field.maxValues}
            variant={variant}
          />
        ) : (
          <SelectRegular
            field={field}
            errorExists={errorExists}
            errorText={errorText}
            value={value}
            onChange={onChange}
            variant={variant}
          />
        )
      }
    />
  );
};
