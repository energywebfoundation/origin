import { TimeFrame } from '@energyweb/utils-general';
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
                value: TimeFrame.Daily,
                label: translate('exchange.properties.periodOptions.daily')
            },
            {
                value: TimeFrame.Weekly,
                label: translate('exchange.properties.periodOptions.weekly')
            },
            {
                value: TimeFrame.Monthly,
                label: translate('exchange.properties.periodOptions.monthly')
            },
            {
                value: TimeFrame.Yearly,
                label: translate('exchange.properties.periodOptions.yearly')
            }
        ];
    } else {
        return [
            {
                value: TimeFrame.Daily,
                label: translate('demand.properties.periodOptions.day')
            },
            {
                value: TimeFrame.Weekly,
                label: translate('demand.properties.periodOptions.week')
            },
            {
                value: TimeFrame.Monthly,
                label: translate('demand.properties.periodOptions.month')
            },
            {
                value: TimeFrame.Yearly,
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
            case TimeFrame.Daily:
                return translate('demand.properties.periodOptions.daily');
            case TimeFrame.Weekly:
                return translate('demand.properties.periodOptions.weekly');
            case TimeFrame.Monthly:
                return translate('demand.properties.periodOptions.monthly');
            case TimeFrame.Yearly:
                return translate('demand.properties.periodOptions.yearly');
        }
    } else {
        switch (timeframe) {
            case TimeFrame.Daily:
                return translate('demand.properties.periodOptions.day');
            case TimeFrame.Weekly:
                return translate('demand.properties.periodOptions.week');
            case TimeFrame.Monthly:
                return translate('demand.properties.periodOptions.month');
            case TimeFrame.Yearly:
                return translate('demand.properties.periodOptions.year');
        }
    }
};

export const configureDateFormat = (date: Date, period: TimeFrame): string => {
    switch (period) {
        case TimeFrame.Daily || TimeFrame.Weekly:
            return moment(date).format('DD MMM, YYYY');
        case TimeFrame.Monthly:
            return moment(date).format('MMM, YYYY');
        case TimeFrame.Yearly:
            return moment(date).format('YYYY');
        default:
            return moment(date).format('DD MMM, YYYY');
    }
};
