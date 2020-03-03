import React from 'react';
import { DatePicker, DatePickerProps } from '@material-ui/pickers';
import { FieldProps } from 'formik';
import { DATE_FORMAT_DMY } from '../../utils/time';
import { ArrowLeft, ArrowRight, AccessAlarms } from '@material-ui/icons';
import { TextField, InputAdornment, TextFieldProps } from '@material-ui/core';

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
    form: { setFieldValue },
    field: { name, value },
    onLeftArrowClick,
    onRightArrowClick,
    ...rest
}: FieldProps<DatePickerProps> & ITextFieldWithArrowsEventHandlers) => (
    <DatePicker
        onChange={newValue => setFieldValue(name, newValue)}
        value={value}
        format={DATE_FORMAT_DMY}
        leftArrowIcon={AccessAlarms}
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
}: FieldProps) => (
    <DatePicker
        onChange={newValue => setFieldValue(name, newValue)}
        value={value}
        format={DATE_FORMAT_DMY}
        {...rest}
    />
);
