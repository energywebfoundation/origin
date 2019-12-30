import React from 'react';
import { TextField, Chip } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

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
}

export function MultiSelectAutocomplete(props: IOwnProps) {
    const { label, placeholder, options, selectedValues, disabled, className } = props;

    return (
        <div className={className}>
            <Autocomplete
                multiple
                filterSelectedOptions
                options={options}
                getOptionLabel={option => option.label}
                onChange={(event, value) => props.onChange(value)}
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
            />
        </div>
    );
}
