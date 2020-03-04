import React, { FocusEventHandler } from 'react';
import { FormControl, FormControlTypeMap } from '@material-ui/core';
import { Field } from 'formik';
import { TextField, TextFieldProps } from 'formik-material-ui';

interface IProps extends Omit<TextFieldProps, 'variant' | 'form' | 'field'> {
    property: string;
    className: string;
    label?: string;
    variant?: FormControlTypeMap['props']['variant'];
    required?: boolean;
    disabled?: boolean;
    type?: string;
    formControlProps?: {
        onBlur: FocusEventHandler;
    };
}

export function FormInput({ formControlProps, ...props }: IProps) {
    const variant = props.variant ?? 'filled';
    const type = props.type ?? 'text';

    return (
        <FormControl
            fullWidth
            variant={variant}
            className={props.className}
            required={props.required}
            {...formControlProps}
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
                {...props}
            />
        </FormControl>
    );
}
