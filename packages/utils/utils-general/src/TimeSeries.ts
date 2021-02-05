import moment from 'moment';

export type TimeSeriesElement = { time: number; value: number };
export type TimeSeries = TimeSeriesElement[];
export type Resolution = 'hour' | 'day' | 'week' | 'month' | 'year';

export class TS {
    public static generate(
        startTimeStamp: number,
        length: number,
        resolution: Resolution,
        value: number
    ): TimeSeries {
        return [...Array(length).keys()].map((i) => ({
            time: moment
                .unix(startTimeStamp)
                .startOf(resolution as moment.unitOfTime.StartOf)
                .add(i, resolution as moment.unitOfTime.DurationConstructor)
                .unix(),
            value
        }));
    }

    public static aggregateByTime(timeSeries: TimeSeries): TimeSeries {
        const reduced = timeSeries
            .reduce((dict, current) => {
                const key = current.time;
                const value = dict.has(key) ? dict.get(key).value + current.value : current.value;

                return dict.set(key, { ...current, value });
            }, new Map<number, TimeSeriesElement>())
            .values();

        return Array.from(reduced);
    }

    public static inRange(timeSeries: TimeSeries, startTimeStamp: number, endTimeStamp: number) {
        return timeSeries.filter(
            (timeSeriesElement) =>
                timeSeriesElement.time >= startTimeStamp && timeSeriesElement.time <= endTimeStamp
        );
    }
}
