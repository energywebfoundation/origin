import React, { FC } from 'react';
import { TextField, Autocomplete, Chip } from '@material-ui/core';
import { FormSelectOption } from '../FormSelect';
import { useSelectAutocompleteEffects } from './SelectAutocomplete.effects';
import { useStyles } from './SelectAutocomplete.styles';

interface SelectAutocompleteProps {
  label: string;
  options: FormSelectOption[];
  onChange: (...event: any[]) => void;
  value: string | number;
  multiple?: boolean;
  maxValues?: number;
  disabled?: boolean;
  required?: boolean;
}

export const SelectAutocomplete: FC<SelectAutocompleteProps> = ({
  label,
  onChange,
  options,
  value,
  multiple,
  maxValues,
  disabled,
  required,
}) => {
  const {
    textValue,
    touchFlag,
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
          helperText={
            touchFlag && required && value !== null
              ? label + ' is a required field'
              : ''
          }
          inputProps={{ ...params.inputProps }}
          error={touchFlag && required && value === null}
          fullWidth
          variant="filled"
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
