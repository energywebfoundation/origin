import { isNumber } from 'lodash';
import { toBN } from '../convert';

export const calculateTotalPrice = (
  priceInDisplayUnit: string,
  energyInDisplayUnit: string
) => {
  if ([priceInDisplayUnit, energyInDisplayUnit].every(isNumber)) {
    return toBN(priceInDisplayUnit)
      .mul(energyInDisplayUnit)
      .toNumber()
      .toFixed(2);
  } else
    throw new Error(
      'Both `priceInDisplayUnit` and `energyInDisplayUnit` must be parsable to number!'
    );
};
