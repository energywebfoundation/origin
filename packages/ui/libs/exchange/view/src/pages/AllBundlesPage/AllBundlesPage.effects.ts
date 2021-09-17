import { BundlePublicDTO } from '@energyweb/exchange-react-query-client';
import {
  useAllDeviceFuelTypes,
  useApiAllBundles,
  useApiAllDevices,
  useApiMyBundles,
  useCachedUser,
} from '@energyweb/origin-ui-exchange-data';
import {
  useAllBundlesTablesLogic,
  useCreateBundleButtonLogic,
} from '@energyweb/origin-ui-exchange-logic';
import {
  ExchangeModalsActionsEnum,
  useExchangeModalsDispatch,
} from '../../context';

export const useAllBundlesPageEffects = () => {
  const user = useCachedUser();
  const { allBundles, isLoading: areAllBundlesLoading } = useApiAllBundles();
  const { myBundles, isLoading: areMyBundlesLoading } = useApiMyBundles(!!user);
  const { allDevices, isLoading: areDevicesLoading } = useApiAllDevices();
  const {
    allTypes: allFuelTypes,
    isLoading: areFuelTypesLoading,
  } = useAllDeviceFuelTypes();

  const dispatchModals = useExchangeModalsDispatch();

  const openDetailsModal = (bundle: BundlePublicDTO) => {
    const isOwner = myBundles?.some((myBundle) => myBundle.id === bundle.id);
    dispatchModals({
      type: ExchangeModalsActionsEnum.SHOW_BUNDLE_DETAILS,
      payload: {
        open: true,
        bundle,
        isOwner,
      },
    });
  };

  const isLoading =
    areAllBundlesLoading ||
    areMyBundlesLoading ||
    areDevicesLoading ||
    areFuelTypesLoading;

  const tableData = useAllBundlesTablesLogic({
    allBundles,
    allDevices,
    allFuelTypes,
    isLoading,
    openDetailsModal,
  });
  const buttonProps = useCreateBundleButtonLogic(user);

  return { tableData, buttonProps };
};
