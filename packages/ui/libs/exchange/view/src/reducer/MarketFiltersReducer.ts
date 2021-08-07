import { FormSelectOption } from '@energyweb/origin-ui-core';
import { Dayjs } from 'dayjs';

export type MarketFiltersState = {
  fuelType: FormSelectOption[];
  deviceType: FormSelectOption[];
  regions: FormSelectOption[];
  subregions: FormSelectOption[];
  gridOperator: FormSelectOption[];
  generationFrom: Dayjs;
  generationTo: Dayjs;
};

export enum MarketFilterActionEnum {
  SET_FUEL_TYPE = 'SET_FUEL_TYPE',
  SET_DEVICE_TYPE = 'SET_DEVICE_TYPE',
  SET_REGIONS = 'SET_REGIONS',
  SET_SUBREGIONS = 'SET_SUBREGIONS',
  SET_GRID_OPERATOR = 'SET_GRID_OPERATOR',
  SET_GENERATION_FROM = 'SET_GENERATION_FROM',
  SET_GENERATION_TO = 'SET_GENERATION_TO',
  SET_MARKET_FILTERS_STATE = 'SET_MARKET_FILTERS_STATE',
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
      type: MarketFilterActionEnum.SET_REGIONS;
      payload: MarketFiltersState['regions'];
    }
  | {
      type: MarketFilterActionEnum.SET_SUBREGIONS;
      payload: MarketFiltersState['subregions'];
    }
  | {
      type: MarketFilterActionEnum.SET_GRID_OPERATOR;
      payload: MarketFiltersState['gridOperator'];
    }
  | {
      type: MarketFilterActionEnum.SET_GENERATION_FROM;
      payload: MarketFiltersState['generationFrom'];
    }
  | {
      type: MarketFilterActionEnum.SET_GENERATION_TO;
      payload: MarketFiltersState['generationTo'];
    }
  | {
      type: MarketFilterActionEnum.SET_MARKET_FILTERS_STATE;
      payload: MarketFiltersState;
    };

export const initialFiltersState: MarketFiltersState = {
  fuelType: [],
  deviceType: [],
  regions: [],
  subregions: [],
  gridOperator: [],
  generationFrom: null,
  generationTo: null,
};

export const filtersReducer = (
  state: MarketFiltersState,
  action: MarketFiltersActions
): MarketFiltersState => {
  switch (action.type) {
    case MarketFilterActionEnum.SET_FUEL_TYPE:
      return { ...state, fuelType: action.payload };
    case MarketFilterActionEnum.SET_DEVICE_TYPE:
      return { ...state, deviceType: action.payload };
    case MarketFilterActionEnum.SET_REGIONS:
      return { ...state, regions: action.payload };
    case MarketFilterActionEnum.SET_SUBREGIONS:
      return { ...state, subregions: action.payload };
    case MarketFilterActionEnum.SET_GRID_OPERATOR:
      return { ...state, gridOperator: action.payload };
    case MarketFilterActionEnum.SET_GENERATION_FROM:
      return { ...state, generationFrom: action.payload };
    case MarketFilterActionEnum.SET_GENERATION_TO:
      return { ...state, generationTo: action.payload };
    case MarketFilterActionEnum.SET_MARKET_FILTERS_STATE:
      return action.payload;
  }
};
