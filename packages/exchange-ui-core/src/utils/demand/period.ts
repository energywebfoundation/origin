import { TimeFrame } from '../exchange';
import moment from 'moment-timezone';

interface IPeriodOption {
    value: TimeFrame;
    label: string;
}

export const periodTypeOptions = (
    translate: (string) => string,
    ending = true
): IPeriodOption[] => {
    if (ending) {
        return [
            {
                value: TimeFrame.daily,
                label: translate('exchange.properties.periodOptions.daily')
            },
            {
                value: TimeFrame.weekly,
                label: translate('exchange.properties.periodOptions.weekly')
            },
            {
                value: TimeFrame.monthly,
                label: translate('exchange.properties.periodOptions.monthly')
            },
            {
                value: TimeFrame.yearly,
                label: translate('exchange.properties.periodOptions.yearly')
            }
        ];
    } else {
        return [
            {
                value: TimeFrame.daily,
                label: translate('demand.properties.periodOptions.day')
            },
            {
                value: TimeFrame.weekly,
                label: translate('demand.properties.periodOptions.week')
            },
            {
                value: TimeFrame.monthly,
                label: translate('demand.properties.periodOptions.month')
            },
            {
                value: TimeFrame.yearly,
                label: translate('demand.properties.periodOptions.year')
            }
        ];
    }
};

export const configureTimeFrame = (
    timeframe: TimeFrame,
    translate: (string) => string,
    ending = true
): string => {
    if (ending) {
        switch (timeframe) {
            case TimeFrame.daily:
                return translate('demand.properties.periodOptions.daily');
            case TimeFrame.weekly:
                return translate('demand.properties.periodOptions.weekly');
            case TimeFrame.monthly:
                return translate('demand.properties.periodOptions.monthly');
            case TimeFrame.yearly:
                return translate('demand.properties.periodOptions.yearly');
        }
    } else {
        switch (timeframe) {
            case TimeFrame.daily:
                return translate('demand.properties.periodOptions.day');
            case TimeFrame.weekly:
                return translate('demand.properties.periodOptions.week');
            case TimeFrame.monthly:
                return translate('demand.properties.periodOptions.month');
            case TimeFrame.yearly:
                return translate('demand.properties.periodOptions.year');
        }
    }
};

export const configureDateFormat = (date: Date, period: TimeFrame): string => {
    switch (period) {
        case TimeFrame.daily || TimeFrame.weekly:
            return moment(date).format('DD MMM, YYYY');
        case TimeFrame.monthly:
            return moment(date).format('MMM, YYYY');
        case TimeFrame.yearly:
            return moment(date).format('YYYY');
        default:
            return moment(date).format('DD MMM, YYYY');
    }
};
