import { useApiFetchMyBundles } from '@energyweb/origin-ui-exchange-data-access';
import { useApiFetchMyDevices } from '@energyweb/origin-ui-device-data';

export const useExchangeMyBundlesPageEffects = () => {
  const { myDevices } = useApiFetchMyDevices();
  const { data: myBundles, isLoading } = useApiFetchMyBundles();
  return { myBundles, myDevices, isLoading };
};
