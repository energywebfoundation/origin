import React, { PropsWithChildren, ReactElement } from 'react';
import { TextField, Autocomplete, Chip } from '@material-ui/core';
import { useSelectAutocompleteEffects } from './SelectAutocomplete.effects';
import { useStyles } from './SelectAutocomplete.styles';
import { GenericFormField } from '../../../containers/GenericForm';

export interface SelectAutocompleteProps<ValueType> {
  value: ValueType;
  field: GenericFormField;
  onChange: (...event: any[]) => void;
  errorExists: boolean;
  errorText: string;
  variant?: 'standard' | 'outlined' | 'filled';
  disabled?: boolean;
  required?: boolean;
  dependentValue?: ValueType;
}

export type TSelectAutocomplete = <ValueType>(
  props: PropsWithChildren<SelectAutocompleteProps<ValueType>>
) => ReactElement;

export const SelectAutocomplete: TSelectAutocomplete = ({
  value,
  field,
  onChange,
  errorExists,
  errorText,
  disabled,
  required,
  variant,
  dependentValue,
}) => {
  const {
    options,
    textValue,
    setTextValue,
    singleChangeHandler,
    multipleChangeHandler,
  } = useSelectAutocompleteEffects(onChange, value, dependentValue, field);
  const classes = useStyles();
  // @should fix bug with nulling the parent
  return (
    <Autocomplete
      multiple={field.multiple}
      filterSelectedOptions
      options={options}
      className={classes.autocomplete}
      inputValue={textValue}
      getOptionLabel={(option) => option.label}
      onChange={field.multiple ? multipleChangeHandler : singleChangeHandler}
      getOptionSelected={(option, value) => option.value === value.value}
      getOptionDisabled={() => disabled}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          required={required}
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
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            label={option.label}
            color="primary"
            key={option.value}
            disabled={disabled}
            {...getTagProps({ index })}
          />
        ))
      }
    />
  );
};
