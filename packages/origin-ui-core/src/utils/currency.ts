const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
});

export function formatCurrency(value: number | string) {
    if (typeof value === 'string') {
        value = parseFloat(value);
    }

    return currencyFormatter.format(value).replace('$', '');
}

export function formatCurrencyComplete(value: number | string, currency: string) {
    if (typeof value === 'string') {
        value = parseFloat(value);
    }

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
    });

    return formatter.format(value);
}
