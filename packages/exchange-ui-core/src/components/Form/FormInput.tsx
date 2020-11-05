import React, { FocusEventHandler } from 'react';
import { FormControlTypeMap } from '@material-ui/core';
import { Field } from 'formik';
import { TextField, TextFieldProps } from 'formik-material-ui';

interface IProps extends Omit<TextFieldProps, 'variant' | 'form' | 'field' | 'meta'> {
    property: string;
    className: string;
    label?: string;
    variant?: FormControlTypeMap['props']['variant'];
    required?: boolean;
    disabled?: boolean;
    type?: string;
    wrapperProps?: {
        onBlur: FocusEventHandler;
    };
}

export function FormInput({ wrapperProps, ...props }: IProps) {
    const variant = props.variant ?? 'filled';
    const type = props.type ?? 'text';

    return (
        <div {...wrapperProps}>
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
        </div>
    );
}
