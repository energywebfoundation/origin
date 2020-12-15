export class TimeRange {
    public readonly from: Date;

    public readonly to: Date;

    public static validate(timeRange: TimeRange) {
        return timeRange.from < timeRange.to;
    }
}
