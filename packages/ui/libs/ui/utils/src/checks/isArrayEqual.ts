import { xorWith, isEmpty, isEqual } from 'lodash';

export const isArrayEqual = <T>(arrayOne: T[], arrayTwo: T[]) =>
  isEmpty(xorWith(arrayOne, arrayTwo, isEqual));
