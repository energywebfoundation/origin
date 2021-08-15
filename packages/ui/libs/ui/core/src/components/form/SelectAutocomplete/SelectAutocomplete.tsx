import React, { PropsWithChildren, ReactElement } from 'react';
import { TextField, Autocomplete, Chip } from '@material-ui/core';
import { useSelectAutocompleteEffects } from './SelectAutocomplete.effects';
import { useStyles } from './SelectAutocomplete.styles';
import { GenericFormField } from '../../../containers/GenericForm';
import { FormSelectOption } from '../FormSelect';

export interface SelectAutocompleteProps<FormValuesType = any> {
  value: FormSelectOption[];
  field: GenericFormField<FormValuesType>;
  onChange: (...event: any[]) => void;
  errorExists?: boolean;
  errorText?: string;
  variant?: 'standard' | 'outlined' | 'filled';
  disabled?: boolean;
  dependentValue?: FormSelectOption[];
  className?: string;
}

export type TSelectAutocomplete = <FormValuesType>(
  props: PropsWithChildren<SelectAutocompleteProps<FormValuesType>>
) => ReactElement;

export const SelectAutocomplete: TSelectAutocomplete = ({
  value,
  field,
  onChange,
  errorExists = false,
  errorText = '',
  disabled,
  variant,
  dependentValue,
  className,
}) => {
  const { options, textValue, setTextValue, changeHandler } =
    useSelectAutocompleteEffects(onChange, dependentValue, field);
  const classes = useStyles();

  return (
    <Autocomplete
      multiple
      filterSelectedOptions
      options={options}
      className={`${classes.autocomplete} ${className}`}
      inputValue={textValue}
      getOptionLabel={(option) => option.label}
      onChange={changeHandler}
      getOptionSelected={(option, value) => option.value === value.value}
      getOptionDisabled={() => disabled}
      disabled={disabled}
      value={value !== undefined ? value : []}
      renderInput={(params) => (
        <TextField
          {...params}
          required={field.required && !(value?.length > 0)}
          label={field.label}
          onChange={(event) => setTextValue(event.target.value)}
          helperText={errorText}
          inputProps={{ ...params.inputProps }}
          error={errorExists}
          variant={variant ?? 'filled'}
          fullWidth
          {...field.textFieldProps}
        />
      )}
      renderTags={(value, getTagProps) => {
        return value.map((option, index) => (
          <Chip
            label={option.label}
            color="primary"
            key={option.value}
            disabled={disabled}
            {...getTagProps({ index })}
          />
        ));
      }}
    />
  );
};
