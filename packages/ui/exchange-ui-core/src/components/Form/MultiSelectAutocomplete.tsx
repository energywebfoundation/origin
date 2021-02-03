import React, { useState } from 'react';
import { TextField, Chip, makeStyles, createStyles, useTheme } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

import { useOriginConfiguration } from '../../utils/configuration';

export interface IAutocompleteMultiSelectOptionType {
    label: string;
    value: string;
    code?: string;
}

interface IOwnProps {
    label: string;
    placeholder: string;
    options: IAutocompleteMultiSelectOptionType[];
    onChange: (value: IAutocompleteMultiSelectOptionType[]) => void;
    selectedValues: IAutocompleteMultiSelectOptionType[];
    disabled?: boolean;
    className?: string;
    max?: number;
    required?: boolean;
    singleChoice?: boolean;
}

export function MultiSelectAutocomplete(props: IOwnProps) {
    const {
        label,
        placeholder,
        options,
        selectedValues,
        disabled,
        className,
        max,
        required,
        singleChoice
    } = props;

    const styleConfig = useOriginConfiguration()?.styleConfig;

    const useStyles = makeStyles(() =>
        createStyles({
            clearIndicator: {
                color: styleConfig.FIELD_ICON_COLOR
            },
            popupIndicator: {
                color: styleConfig.FIELD_ICON_COLOR
            }
        })
    );

    const classes = useStyles(useTheme());
    const [touchFlag, setTouchFlag] = useState<boolean>(null);
    const [textValue, setTextValue] = useState<string>('');

    return (
        <div className={className}>
            <Autocomplete
                multiple
                filterSelectedOptions
                options={options}
                inputValue={textValue}
                getOptionLabel={(option) => option.label}
                onChange={(event, value: IAutocompleteMultiSelectOptionType[]) => {
                    props.onChange(value ? value.slice(0, max ?? value.length) : value);
                    setTouchFlag(true);
                    if (singleChoice) {
                        setTextValue(' ');
                    } else {
                        setTextValue('');
                    }
                }}
                value={selectedValues}
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
                renderInput={(params) => (
                    <TextField
                        {...params}
                        required={required}
                        label={label}
                        onChange={(event) => setTextValue(event.target.value)}
                        helperText={
                            touchFlag && required && props.selectedValues.length === 0
                                ? label + ' is a required field'
                                : ''
                        }
                        inputProps={{ ...params.inputProps }}
                        error={touchFlag && required && props.selectedValues.length === 0}
                        placeholder={placeholder}
                        fullWidth
                        variant="filled"
                    />
                )}
                getOptionSelected={(option, value) => option.value === value.value}
                getOptionDisabled={() => disabled}
                disabled={disabled}
                classes={classes}
            />
        </div>
    );
}
