import React from 'react';
import { DatePicker } from '@material-ui/pickers';
import { FieldProps } from 'formik';
import { DATE_FORMAT_DMY } from '../utils/helper';

export const FormikDatePicker = ({
    form: { setFieldValue },
    field: { name, value },
    ...rest
}: FieldProps) => (
    <DatePicker
        onChange={newValue => setFieldValue(name, newValue)}
        value={value}
        format={DATE_FORMAT_DMY}
        {...rest}
    />
);
