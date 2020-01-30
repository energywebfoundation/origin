import React from 'react';
import { FormControl, FormControlTypeMap } from '@material-ui/core';
import { Field } from 'formik';
import { TextField } from 'formik-material-ui';

interface IProps {
    property: string;
    className: string;
    label?: string;
    variant?: FormControlTypeMap['props']['variant'];
    required?: boolean;
    disabled?: boolean;
    type?: string;
}

export function FormInput(props: IProps) {
    const variant = props.variant ?? 'filled';
    const type = props.type ?? 'text';

    return (
        <FormControl
            fullWidth
            variant={variant}
            className={props.className}
            required={props.required}
        >
            <Field
                label={props.label}
                name={props.property}
                component={TextField}
                variant={variant}
                fullWidth
                required={props.required}
                disabled={props.disabled}
                type={type}
            />
        </FormControl>
    );
}
