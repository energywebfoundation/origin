import React from 'react';
import { TextField, Chip, makeStyles, createStyles, useTheme } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { STYLE_CONFIG } from '../styles/styleConfig';

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

    const useStyles = makeStyles(() =>
        createStyles({
            clearIndicator: {
                color: STYLE_CONFIG.FIELD_ICON_COLOR
            },
            popupIndicator: {
                color: STYLE_CONFIG.FIELD_ICON_COLOR
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
                getOptionLabel={option => option.label}
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
                renderInput={params => (
                    <TextField {...params} label={label} placeholder={placeholder} fullWidth />
                )}
                getOptionSelected={(option, value) => option.value === value.value}
                getOptionDisabled={() => disabled}
                disabled={disabled}
                classes={classes}
            />
        </div>
    );
}
