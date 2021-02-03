import React from 'react';
import { Field } from 'formik';
import { FormikDatePicker } from '.';
import { InputAdornment } from '@material-ui/core';
import { CalendarToday } from '@material-ui/icons';
import { TimeFrame } from '@energyweb/utils-general';
import { DATE_FORMAT_MY, DATE_FORMAT_Y } from '@energyweb/origin-ui-core';

interface IProps {
    name: string;
    label: string;
    period: TimeFrame;
}

export const CalendarFieldOnPeriod = (props: IProps) => {
    const { name, label, period } = props;

    const view: string[] = [];
    let format: string;

    switch (period) {
        case TimeFrame.Monthly:
            view.push('year', 'month');
            format = DATE_FORMAT_MY;
            break;
        case TimeFrame.Yearly:
            view.push('year');
            format = DATE_FORMAT_Y;
            break;
    }

    if (view.length > 0) {
        return (
            <Field
                name={name}
                label={label}
                className="mt-3"
                inputVariant="filled"
                variant="inline"
                fullWidth
                required
                views={view}
                format={format}
                component={FormikDatePicker}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <CalendarToday />
                        </InputAdornment>
                    )
                }}
            />
        );
    } else {
        return (
            <Field
                name={name}
                label={label}
                className="mt-3"
                inputVariant="filled"
                variant="inline"
                fullWidth
                required
                component={FormikDatePicker}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <CalendarToday />
                        </InputAdornment>
                    )
                }}
            />
        );
    }
};
