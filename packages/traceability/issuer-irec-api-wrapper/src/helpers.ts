/**
 * Formats date object to date (YYYY-MM-DD).
 * It respects timezone only if `process.env.TZ` is set.
 * If not, it will format date for UTC.
 */
export const timeToTimezoneDate = (time?: Date) => {
    if (!time) {
        return time;
    }

    if (process.env.TZ) {
        const year = time.getFullYear();
        const month = time.getMonth() + 1;
        const day = time.getDate();

        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    } else {
        return time.toISOString().split('T')[0];
    }
};
