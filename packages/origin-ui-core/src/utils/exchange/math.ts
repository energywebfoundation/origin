export function calculateTotalPrice(priceInDisplayUnit: string, energyInDisplayUnit: string) {
    const priceAsFloat = parseFloat(priceInDisplayUnit);
    const energyAsFloat = parseFloat(energyInDisplayUnit);

    if (isNaN(priceAsFloat) || isNaN(energyAsFloat) || !priceAsFloat || !energyAsFloat) {
        return 0;
    }

    return (priceAsFloat * energyAsFloat).toFixed(2);
}
