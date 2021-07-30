import { xorWith, isEmpty, isEqual } from 'lodash';

export const isArrayEqual = (arrayOne: any[], arrayTwo: any[]) =>
  isEmpty(xorWith(arrayOne, arrayTwo, isEqual));
