import React from 'react';
import { ArrowLeft, ArrowRight } from '@material-ui/icons';
import { TextField, InputAdornment, TextFieldProps } from '@material-ui/core';
import {
    DatePicker as DatePickerMaterial,
    DatePickerProps as DatePickerPropsMaterial
} from '@material-ui/pickers';
import { DatePicker, DatePickerProps } from 'formik-material-ui-pickers';
import { FieldProps, Field, useFormikContext } from 'formik';
import { Moment, DATE_FORMAT_DMY } from '../../utils';

interface ITextFieldWithArrowsEventHandlers {
    onLeftArrowClick: () => void;
    onRightArrowClick: () => void;
}

type TextFieldWithArrowsProps = TextFieldProps & ITextFieldWithArrowsEventHandlers;

const TextFieldWithArrows = ({
    onLeftArrowClick,
    onRightArrowClick,
    ...rest
}: TextFieldWithArrowsProps) => (
    <TextField
        {...rest}
        InputProps={{
            endAdornment: (
                <InputAdornment position="end">
                    <ArrowLeft
                        style={{ cursor: 'pointer' }}
                        onClick={event => {
                            event.stopPropagation();

                            onLeftArrowClick();
                        }}
                    />
                    <ArrowRight
                        style={{ cursor: 'pointer' }}
                        onClick={event => {
                            event.stopPropagation();

                            onRightArrowClick();
                        }}
                    />
                </InputAdornment>
            )
        }}
    />
);

export const FormikDatePickerWithArrows = ({
    onLeftArrowClick,
    onRightArrowClick,
    ...rest
}: DatePickerProps & ITextFieldWithArrowsEventHandlers) => (
    <DatePicker
        format={DATE_FORMAT_DMY}
        TextFieldComponent={(props: TextFieldProps) => (
            <TextFieldWithArrows
                onLeftArrowClick={onLeftArrowClick}
                onRightArrowClick={onRightArrowClick}
                {...props}
            />
        )}
        {...rest}
    />
);

export const FormikDatePicker = ({
    form: { setFieldValue },
    field: { name, value },
    ...rest
}: FieldProps<DatePickerPropsMaterial>) => (
    <DatePickerMaterial
        onChange={newValue => setFieldValue(name, newValue)}
        value={value}
        format={DATE_FORMAT_DMY}
        {...rest}
    />
);

export const FormikDatePickerWithMonthArrowsFilled = ({
    name,
    label,
    disabled,
    required
}: {
    name: string;
    label: string;
    disabled: boolean;
    required: boolean;
}) => {
    const { setFieldValue, values } = useFormikContext();

    return (
        <Field
            name={name}
            label={label}
            inputVariant="filled"
            variant="inline"
            fullWidth
            required={required}
            component={FormikDatePickerWithArrows}
            disabled={disabled}
            views={['year', 'month']}
            format={null}
            onLeftArrowClick={() =>
                setFieldValue(
                    name,
                    (values[name] as Moment)
                        .clone()
                        .subtract(1, 'month')
                        .startOf('month')
                )
            }
            onRightArrowClick={() =>
                values[name] &&
                setFieldValue(
                    name,
                    (values[name] as Moment)
                        .clone()
                        .add(1, 'month')
                        .endOf('month')
                )
            }
        />
    );
};
