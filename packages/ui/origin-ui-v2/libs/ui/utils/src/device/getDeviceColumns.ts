import { isDeviceGridOperatorEnabled, isDeviceLocationEnabled } from './index';
import { IEnvironment, TDeviceColumn } from '../types';
import {
  GRID_OPERATOR_TITLE_TRANSLATION_KEY,
  LOCATION_TITLE_TRANSLATION_KEY,
} from '../constants';

export function getDeviceColumns<T extends any>(
  environment: IEnvironment,
  t: (string) => string,
  locationSortProperties?: ((T) => string)[],
  gridOperatorSortProperties?: ((T) => string)[]
) {
  const columns: TDeviceColumn<T>[] = [];

  if (isDeviceLocationEnabled(environment)) {
    columns.push({
      id: 'deviceLocation',
      label: t(LOCATION_TITLE_TRANSLATION_KEY),
      sortProperties: locationSortProperties,
    });
  }

  if (isDeviceGridOperatorEnabled(environment)) {
    columns.push({
      id: 'gridOperator',
      label: t(GRID_OPERATOR_TITLE_TRANSLATION_KEY),
      sortProperties: gridOperatorSortProperties,
    });
  }

  return columns;
}
