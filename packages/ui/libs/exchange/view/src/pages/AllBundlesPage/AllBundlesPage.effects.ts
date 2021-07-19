import {
  useAllDeviceFuelTypes,
  useApiAllBundles,
  useApiAllDevices,
  useCachedUser,
} from '@energyweb/origin-ui-exchange-data';
import {
  useAllBundlesTablesLogic,
  useCreateBundleButtonLogic,
} from '@energyweb/origin-ui-exchange-logic';

export const useAllBundlesPageEffects = () => {
  const { allBundles, isLoading: areBundlesLoading } = useApiAllBundles();
  const { allDevices, isLoading: areDevicesLoading } = useApiAllDevices();
  const { allTypes: allFuelTypes, isLoading: areFuelTypesLoading } =
    useAllDeviceFuelTypes();
  const user = useCachedUser();

  const isLoading =
    areBundlesLoading || areDevicesLoading || areFuelTypesLoading;
  const tableData = useAllBundlesTablesLogic({
    allBundles,
    allDevices,
    allFuelTypes,
    isLoading,
  });
  const buttonProps = useCreateBundleButtonLogic(user);

  return { tableData, buttonProps };
};
