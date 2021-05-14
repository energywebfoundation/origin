import React, { FC } from 'react';
import {
  TextField,
  Autocomplete,
  Chip,
  BaseTextFieldProps,
} from '@material-ui/core';
import { FormSelectOption } from '../FormSelect';
import { useSelectAutocompleteEffects } from './SelectAutocomplete.effects';
import { useStyles } from './SelectAutocomplete.styles';

export interface SelectAutocompleteProps {
  label: string;
  options: FormSelectOption[];
  onChange: (...event: any[]) => void;
  errorExists: boolean;
  errorText: string;
  variant?: 'standard' | 'outlined' | 'filled';
  multiple?: boolean;
  maxValues?: number;
  disabled?: boolean;
  required?: boolean;
  textFieldProps?: BaseTextFieldProps;
}

export const SelectAutocomplete: FC<SelectAutocompleteProps> = ({
  label,
  onChange,
  options,
  multiple,
  errorExists,
  errorText,
  maxValues,
  disabled,
  required,
  variant,
  textFieldProps,
}) => {
  const {
    textValue,
    setTextValue,
    singleChangeHandler,
    multipleChangeHandler,
  } = useSelectAutocompleteEffects(onChange, maxValues);
  const classes = useStyles();

  return (
    <Autocomplete
      multiple={multiple}
      filterSelectedOptions
      options={options}
      className={classes.autocomplete}
      inputValue={textValue}
      getOptionLabel={(option) => option.label}
      onChange={multiple ? multipleChangeHandler : singleChangeHandler}
      getOptionSelected={(option, value) => option.value === value.value}
      getOptionDisabled={() => disabled}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          required={required}
          label={label}
          onChange={(event) => setTextValue(event.target.value)}
          helperText={errorText}
          inputProps={{ ...params.inputProps }}
          error={errorExists}
          variant={variant ?? 'filled'}
          fullWidth
          {...textFieldProps}
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
