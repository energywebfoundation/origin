import React from 'react';
import { FormControl } from '@material-ui/core';
import { Field } from 'formik';
import { TextField } from 'formik-material-ui';

interface IProps {
    label: string;
    property: string;
    className: string;
    required?: boolean;
    disabled?: boolean;
}

export function FormInput(props: IProps) {
    return (
        <FormControl
            fullWidth
            variant="filled"
            className={props.className}
            required={props.required}
        >
            <Field
                label={props.label}
                name={props.property}
                component={TextField}
                variant="filled"
                fullWidth
                required={props.required}
                disabled={props.disabled}
            />
        </FormControl>
    );
}
