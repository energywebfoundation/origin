import {
  useApiAllDemands,
  useCachedAllFuelTypes,
} from '@energyweb/origin-ui-exchange-data';
import { useDemandsTableLogic } from '@energyweb/origin-ui-exchange-logic';

export const useDemandsTableEffects = () => {
  const allFuelTypes = useCachedAllFuelTypes();
  const { allDemands, isLoading } = useApiAllDemands();

  const tableData = useDemandsTableLogic({
    demands: allDemands,
    isLoading,
    allFuelTypes,
  });

  return tableData;
};
