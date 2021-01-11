import React from 'react';
import { ArrowLeft, ArrowRight, Clear } from '@material-ui/icons';
import { TextField, InputAdornment, TextFieldProps } from '@material-ui/core';
import {
    DatePicker as DatePickerMaterial,
    DatePickerProps as DatePickerPropsMaterial
} from '@material-ui/pickers';
import { DatePicker, DatePickerProps } from 'formik-material-ui-pickers';
import { FieldProps, Field, useFormikContext } from 'formik';
import { Moment, DATE_FORMAT_DMY } from '@energyweb/origin-ui-core';
import { useSelector } from 'react-redux';
import { getEnvironment, IEnvironment } from '../../features/general';

interface ITextFieldWithArrowsEventHandlers {
    onLeftArrowClick: () => void;
    onRightArrowClick: () => void;
    onClearClick?: () => void;
    showClearButton: boolean;
}

type TextFieldWithArrowsProps = TextFieldProps & ITextFieldWithArrowsEventHandlers;

const TextFieldWithArrows = ({
    onLeftArrowClick,
    onRightArrowClick,
    onClearClick,
    showClearButton,
    ...rest
}: TextFieldWithArrowsProps) => (
    <TextField
        {...rest}
        InputProps={{
            endAdornment: (
                <InputAdornment position="end">
                    {showClearButton && (
                        <Clear
                            style={{ cursor: 'pointer' }}
                            onClick={(event) => {
                                event.stopPropagation();

                                onClearClick();
                            }}
                        />
                    )}
                    <ArrowLeft
                        style={{ cursor: 'pointer' }}
                        onClick={(event) => {
                            event.stopPropagation();

                            onLeftArrowClick();
                        }}
                    />
                    <ArrowRight
                        style={{ cursor: 'pointer' }}
                        onClick={(event) => {
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
    onClearClick,
    showClearButton,
    ...rest
}: DatePickerProps & ITextFieldWithArrowsEventHandlers) => (
    <DatePicker
        autoOk={true}
        format={DATE_FORMAT_DMY}
        TextFieldComponent={(props: TextFieldProps) => (
            <TextFieldWithArrows
                onLeftArrowClick={onLeftArrowClick}
                onRightArrowClick={onRightArrowClick}
                onClearClick={onClearClick}
                showClearButton={showClearButton}
                {...props}
            />
        )}
        {...rest}
    />
);

export const FormikDatePicker = ({ form, field, ...rest }: FieldProps<DatePickerPropsMaterial>) => {
    const setFieldValue = form?.setFieldValue;
    const name = field?.name;
    const value = field?.value;
    return (
        <DatePickerMaterial
            onChange={(newValue) => setFieldValue(name, newValue)}
            value={value}
            format={DATE_FORMAT_DMY}
            {...rest}
        />
    );
};

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
    const environment: IEnvironment = useSelector(getEnvironment);
    const setFieldValue = useFormikContext()?.setFieldValue;
    const values = useFormikContext()?.values;

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
            helperText={false}
            error={false}
            format={null}
            showClearButton={!!values[name]}
            onClearClick={() => setFieldValue(name, null)}
            onLeftArrowClick={() =>
                setFieldValue(
                    name,
                    (values[name] as Moment)
                        .clone()
                        .utcOffset(Number(environment.MARKET_UTC_OFFSET), true)
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
                        .utcOffset(Number(environment.MARKET_UTC_OFFSET), true)
                        .add(1, 'month')
                        .endOf('month')
                )
            }
        />
    );
};
