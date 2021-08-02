import React, { PropsWithChildren, ReactElement } from 'react';
import { Control, Controller, useWatch } from 'react-hook-form';
import { GenericFormField } from '../../../containers';
import { SelectAutocomplete } from '../SelectAutocomplete';
import { SelectRegular } from '../SelectRegular';

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
  const watchedValue = useWatch({
    name: field.dependentOn as any,
    control,
  });
  const dependentValue = !!field.dependentOn ? watchedValue : undefined;

  return (
    <Controller
      name={field.name as any}
      control={control}
      render={({ field: { value, onChange } }) => {
        return field.autocomplete ? (
          <SelectAutocomplete
            value={value as FormSelectOption[]}
            field={field}
            onChange={onChange}
            errorExists={errorExists}
            errorText={errorText}
            variant={variant}
            dependentValue={dependentValue as FormSelectOption[]}
          />
        ) : (
          <SelectRegular
            field={field}
            errorExists={errorExists}
            errorText={errorText}
            value={value as any}
            onChange={onChange}
            variant={variant}
            textFieldProps={field.textFieldProps}
          />
        );
      }}
    />
  );
};
