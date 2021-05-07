const defaultCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function formatCurrency(value: number | string) {
  return defaultCurrencyFormatter.format(Number(value)).replace('$', '');
}

export const formatCurrencyComplete = (
  value: number | string,
  currency = 'USD'
) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
    useGrouping: true,
    maximumFractionDigits: 2,
  });

  return formatter.format(Number(value));
};
