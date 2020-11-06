import { EnergyFormatter } from '@energyweb/origin-ui-core';
import { IExchangeClient, ICalculateVolumeData } from '.';

export function calculateTotalPrice(priceInDisplayUnit: string, energyInDisplayUnit: string) {
    const priceAsFloat = parseFloat(priceInDisplayUnit);
    const energyAsFloat = parseFloat(energyInDisplayUnit);

    if (isNaN(priceAsFloat) || isNaN(energyAsFloat) || !priceAsFloat || !energyAsFloat) {
        return 0;
    }

    return (priceAsFloat * energyAsFloat).toFixed(2);
}

export async function calculateTotalVolume(client: IExchangeClient, values: ICalculateVolumeData) {
    const { volume, period, start, end } = values;
    const parsedVolume = parseFloat(volume);

    if (parsedVolume > 0 && period && start && end) {
        const summary = await client?.summary({
            price: 1 * 100,
            volumePerPeriod: EnergyFormatter.getBaseValueFromValueInDisplayUnit(
                parsedVolume
            ).toString(),
            periodTimeFrame: period,
            start,
            end,
            product: {},
            boundToGenerationTime: false,
            excludeEnd: false
        });
        return EnergyFormatter.format(Number(summary?.volume));
    } else {
        return '';
    }
}
