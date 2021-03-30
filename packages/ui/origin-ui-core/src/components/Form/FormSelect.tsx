import React from 'react';
import { FormControl, InputLabel, FilledInput, MenuItem } from '@material-ui/core';
import { Field } from 'formik';
import { Select } from 'formik-material-ui';

interface IFormSelectOption {
    value: string | number;
    label: string;
    code?: string;
}

interface IFormSelectProps {
    label: string;
    property: string;
    currentValue: string | number;
    options: IFormSelectOption[];
    className?: string;
    required?: boolean;
    disabled?: boolean;
}

export function FormSelect(props: IFormSelectProps) {
    const {
        label,
        property,
        currentValue,
        options,
        className,
        required,
        disabled,
        ...otherProps
    } = props;

    return (
        <FormControl
            fullWidth
            variant="filled"
            className={className}
            required={required}
            {...otherProps}
        >
            <InputLabel required>{label}</InputLabel>
            <Field
                name={property}
                label={label}
                component={Select}
                input={<FilledInput value={currentValue ?? ''} />}
                fullWidth
                variant="filled"
                required={required}
                disabled={disabled}
            >
                {options.map((option) => (
                    <MenuItem value={option.code || option.value} key={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </Field>
        </FormControl>
    );
}
