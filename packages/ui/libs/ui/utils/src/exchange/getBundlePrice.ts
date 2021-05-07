import { Bundle } from '../types';
import { Unit } from '@energyweb/utils-general';
import { EnergyFormatter } from '../formatters';
import { toBN } from '../convert';

/**
 * Un-formatted price
 *
 * @param
 */
export const getBundlePrice = ({ volume, price }: Partial<Bundle>) =>
  toBN(price)
    .mul(volume)
    .div(Unit[EnergyFormatter.displayUnit] * 100);
