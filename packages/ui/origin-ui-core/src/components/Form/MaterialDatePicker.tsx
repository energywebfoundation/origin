import React from 'react';
import { DatePicker, DatePickerProps } from '@material-ui/pickers';

interface IProps extends DatePickerProps {
    value: string;
}

export function MaterialDatePicker(props: IProps) {
    const {
        label,
        value,
        onChange,
        format,
        views,
        openTo,
        disableFuture = false,
        variant,
        ...otherProps
    } = props;

    return (
        <DatePicker
            autoOk
            disableFuture={disableFuture}
            variant={variant ?? 'inline'}
            openTo={openTo ?? 'year'}
            format={format ?? 'DD.MM.YYYY'}
            label={label}
            views={views ?? ['year', 'month', 'date']}
            value={value}
            onChange={onChange}
            {...otherProps}
        />
    );
}
