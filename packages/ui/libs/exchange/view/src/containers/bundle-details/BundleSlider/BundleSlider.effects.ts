const COUNT_OF_PRICE_MARKS = 10;

export const useBundleSliderEffects = (minPrice: number, maxPrice: number) => {
  const priceStep = Math.floor(
    (maxPrice - minPrice) / (COUNT_OF_PRICE_MARKS - 1)
  );

  const marks = Array.from(Array(COUNT_OF_PRICE_MARKS).keys()).map((i) => {
    const from = minPrice;
    const value = from + i * priceStep;
    return { value, label: String(value) };
  });

  return { priceStep, marks };
};
