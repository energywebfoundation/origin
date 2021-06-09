import { Control, Controller } from 'react-hook-form';
import React, { memo, PropsWithChildren, ReactElement } from 'react';
import { convertLevelToSelectOptions } from '@energyweb/origin-ui-utils';
import { GenericFormField } from '../../../containers';
import { SelectAutocomplete } from '../SelectAutocomplete';
import { useHierarchicalSelectEffects } from './HierarchicalSelect.effects';

export type FormHierarchicalSelectOption = {
  value: string;
  label: string;
};

export type HierarchicalSelectOptions = {
  [key: string]: string[][];
};

export interface HierarchicalSelectProps<FormValuesType> {
  field: GenericFormField;
  control: Control<FormValuesType>;
  errorExists: boolean;
  errorText: string;
  variant?: 'standard' | 'outlined' | 'filled';
  disabled: boolean;
}

export type THierarchicalSelect = <FormValuesType>(
  props: PropsWithChildren<HierarchicalSelectProps<FormValuesType>>
) => ReactElement;

export const HierarchicalSelect: THierarchicalSelect = memo(
  ({ field, control, errorExists, errorText, variant }) => {
    const { inputDisplayer, getRelevantOptions } =
      useHierarchicalSelectEffects();

    return (
      <Controller
        name={field.name as any}
        control={control}
        render={({ field: { value, onChange } }) => (
          <>
            {Object.keys(field.hierarchicalOptions).map((level, idx) => {
              const relevantOptions = getRelevantOptions(
                value as string,
                field.hierarchicalOptions[level]
              );
              const showInput = inputDisplayer(value as string, idx);
              return (
                showInput && (
                  <SelectAutocomplete
                    key={field.label + field.hierarchicalOptions[level].length}
                    label={field.label}
                    options={convertLevelToSelectOptions(relevantOptions)}
                    onChange={onChange}
                    errorExists={errorExists}
                    errorText={errorText}
                    multiple={field.multiple}
                    maxValues={field.maxValues}
                    variant={variant}
                    textFieldProps={field.textFieldProps}
                  />
                )
              );
            })}
          </>
        )}
      />
    );
  }
);
