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
    return (
        <FormControl
            fullWidth
            variant="filled"
            className={props.className}
            required={props.required}
        >
            <InputLabel required>{props.label}</InputLabel>
            <Field
                name={props.property}
                label={props.label}
                component={Select}
                input={<FilledInput value={props.currentValue ?? ''} />}
                fullWidth
                variant="filled"
                required={props.required}
                disabled={props.disabled}
            >
                {props.options.map((option) => (
                    <MenuItem value={option.code || option.value} key={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </Field>
        </FormControl>
    );
}
