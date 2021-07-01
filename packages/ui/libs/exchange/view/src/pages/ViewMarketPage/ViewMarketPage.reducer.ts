import { FormSelectOption } from '@energyweb/origin-ui-core';

export type MarketFiltersState = {
  fuelType: FormSelectOption[];
  deviceType: FormSelectOption[];
  region: FormSelectOption[];
  gridOperator: FormSelectOption[];
};

export enum MarketFilterActionEnum {
  SET_FUEL_TYPE = 'SET_FUEL_TYPE',
  SET_DEVICE_TYPE = 'SET_DEVICE_TYPE',
  SET_REGION = 'SET_REGION',
  SET_GRID_OPERATOR = 'SET_GRID_OPERATOR',
}

export type MarketFiltersActions =
  | {
      type: MarketFilterActionEnum.SET_FUEL_TYPE;
      payload: MarketFiltersState['fuelType'];
    }
  | {
      type: MarketFilterActionEnum.SET_DEVICE_TYPE;
      payload: MarketFiltersState['deviceType'];
    }
  | {
      type: MarketFilterActionEnum.SET_REGION;
      payload: MarketFiltersState['region'];
    }
  | {
      type: MarketFilterActionEnum.SET_GRID_OPERATOR;
      payload: MarketFiltersState['gridOperator'];
    };

export const initialState: MarketFiltersState = {
  fuelType: [],
  deviceType: [],
  region: [],
  gridOperator: [],
};

export const reducer = (
  state: MarketFiltersState,
  action: MarketFiltersActions
): MarketFiltersState => {
  switch (action.type) {
    case MarketFilterActionEnum.SET_FUEL_TYPE:
      return { ...state, fuelType: action.payload };
    case MarketFilterActionEnum.SET_DEVICE_TYPE:
      return { ...state, deviceType: action.payload };
    case MarketFilterActionEnum.SET_REGION:
      return { ...state, region: action.payload };
    case MarketFilterActionEnum.SET_GRID_OPERATOR:
      return { ...state, gridOperator: action.payload };
  }
};
