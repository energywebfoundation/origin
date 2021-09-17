import { useApiBundleSplits } from '@energyweb/origin-ui-exchange-data';
import {
  ExchangeModalsActionsEnum,
  useExchangeModalsDispatch,
  useExchangeModalsStore,
} from '../../../context';

export const useBundleDetailsEffects = () => {
  const {
    bundleDetails: { open, bundle, isOwner },
  } = useExchangeModalsStore();
  const dispatchModals = useExchangeModalsDispatch();

  const handleClose = () => {
    dispatchModals({
      type: ExchangeModalsActionsEnum.SHOW_BUNDLE_DETAILS,
      payload: {
        open: false,
        bundle: null,
        isOwner: false,
      },
    });
  };

  const { splits, isLoading } = useApiBundleSplits(bundle?.id);

  return { open, bundle, handleClose, isLoading, splits, isOwner };
};
