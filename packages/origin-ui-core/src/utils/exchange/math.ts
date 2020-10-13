export function calculateTotalPrice(priceInDisplayUnit: string, energyInDisplayUnit: string) {
    const priceAsFloat = parseFloat(priceInDisplayUnit);
    const energyAsFloat = parseFloat(energyInDisplayUnit);

    if (isNaN(priceAsFloat) || isNaN(energyAsFloat) || !priceAsFloat || !energyAsFloat) {
        return 0;
    }

    return (priceAsFloat * energyAsFloat).toFixed(2);
}

export function calculateDemandTotalVolume(period, volume, startDate, endDate) {
    if (period && volume && startDate && endDate) {
        const start = +new Date(startDate);
        const end = +new Date(endDate);
        const dayDifference = Math.round((end - start) / (60 * 60 * 24 * 1000));
        const parsedVolume = parseInt(volume, 10);
        const setDivisor = (timeframe) => {
            switch (timeframe) {
                case 0:
                    return 365;
                case 1:
                    return 30;
                case 2:
                    return 1;
                case 3:
                    return 7;
                default:
                    return 1;
            }
        };
        const divisor = setDivisor(period);

        if (dayDifference > 0 && parsedVolume > 0) {
            const numberOfOccurrences = Math.round(dayDifference / divisor) + 1;
            return parsedVolume * numberOfOccurrences;
        }
    } else {
        return '';
    }
}
