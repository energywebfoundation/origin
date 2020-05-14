import React from 'react';
import { TextField, Chip, makeStyles, createStyles, useTheme } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

import { useOriginConfiguration } from '../utils/configuration';

export interface IAutocompleteMultiSelectOptionType {
    label: string;
    value: string;
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
}

export function MultiSelectAutocomplete(props: IOwnProps) {
    const { label, placeholder, options, selectedValues, disabled, className, max } = props;

    const { styleConfig } = useOriginConfiguration();

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

    return (
        <div className={className}>
            <Autocomplete
                multiple
                filterSelectedOptions
                options={options}
                getOptionLabel={(option) => option.label}
                onChange={(event, value: IAutocompleteMultiSelectOptionType[]) => {
                    props.onChange(value ? value.slice(0, max ?? value.length) : value);
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
                        label={label}
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
