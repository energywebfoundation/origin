import { FormSelectOption } from '@energyweb/origin-ui-core';
import {
  useAllDeviceFuelTypes,
  useAllDeviceTypes,
  useApiRegionsConfiguration,
} from '@energyweb/origin-ui-exchange-data';
import {
  useDeviceTypeFilterLogic,
  useFuelTypeFilterLogic,
  useGridOperatorFilterLogic,
  useRegionsFilterLogic,
  useSubRegionsFilterLogic,
} from '@energyweb/origin-ui-exchange-logic';
import { MarketFilterActionEnum } from '../../../pages';
import { MarketFiltersProps } from './MarketFilters';

export const useMarketFiltersEffects = ({
  state,
  dispatch,
}: MarketFiltersProps) => {
  const { allTypes: allFuelTypes, isLoading: areFuelTypesLoading } =
    useAllDeviceFuelTypes();
  const { allTypes: allDeviceTypes, isLoading: areDeviceTypesLoading } =
    useAllDeviceTypes();

  const handleFuelTypeChange = (newValues: FormSelectOption[]) => {
    dispatch({
      type: MarketFilterActionEnum.SET_FUEL_TYPE,
      payload: newValues,
    });
  };
  const fuelTypeAutocompleteProps = useFuelTypeFilterLogic(
    allFuelTypes,
    state.fuelType,
    handleFuelTypeChange
  );

  const handleDeviceTypeChange = (newValues: FormSelectOption[]) => {
    dispatch({
      type: MarketFilterActionEnum.SET_DEVICE_TYPE,
      payload: newValues,
    });
  };
  const deviceTypeAutocompleteProps = useDeviceTypeFilterLogic(
    allFuelTypes,
    allDeviceTypes,
    state.deviceType,
    handleDeviceTypeChange,
    state.fuelType
  );

  const handleGridOperatorChange = (newValues: FormSelectOption[]) => {
    dispatch({
      type: MarketFilterActionEnum.SET_GRID_OPERATOR,
      payload: newValues,
    });
  };
  const gridOperatorAutocompleteProps = useGridOperatorFilterLogic(
    state.gridOperator,
    handleGridOperatorChange
  );

  const {
    allRegions,
    country,
    isLoading: areRegionsLoading,
  } = useApiRegionsConfiguration();
  const handleRegionChange = (newValues: FormSelectOption[]) => {
    dispatch({
      type: MarketFilterActionEnum.SET_REGIONS,
      payload: newValues,
    });
  };
  const regionsAutocompleteProps = useRegionsFilterLogic(
    state.regions,
    handleRegionChange,
    allRegions
  );

  const handleSubRegionChange = (newValues: FormSelectOption[]) => {
    dispatch({
      type: MarketFilterActionEnum.SET_SUBREGIONS,
      payload: newValues,
    });
  };
  const subRegionsAutocompleteProps = useSubRegionsFilterLogic(
    state.subregions,
    handleSubRegionChange,
    country,
    allRegions,
    state.regions
  );

  const isLoading =
    areFuelTypesLoading || areDeviceTypesLoading || areRegionsLoading;

  return {
    fuelTypeAutocompleteProps,
    deviceTypeAutocompleteProps,
    gridOperatorAutocompleteProps,
    regionsAutocompleteProps,
    subRegionsAutocompleteProps,
    isLoading,
  };
};
