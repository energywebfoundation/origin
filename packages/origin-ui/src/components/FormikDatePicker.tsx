import React from 'react';
import { DatePicker } from '@material-ui/pickers';
import { FieldProps } from 'formik';

export const FormikDatePicker = ({
    form: { setFieldValue },
    field: { name, value },
    ...rest
}: FieldProps) => (
    <DatePicker onChange={newValue => setFieldValue(name, newValue)} value={value} {...rest} />
);
