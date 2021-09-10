import {
  SupplyDto,
  useSupplyControllerFindAll,
} from '@energyweb/exchange-react-query-client';

export const useAllSupply = () => {
  const { data, isLoading } = useSupplyControllerFindAll();
  const allSupply = data ?? ([] as SupplyDto[]);

  return {
    allSupply,
    isLoading,
  };
};
