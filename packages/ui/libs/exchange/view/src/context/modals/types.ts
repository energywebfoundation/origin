import {
  Bundle,
  BundlePublicDTO,
} from '@energyweb/exchange-react-query-client';
import { ExchangeModalsActionsEnum } from './reducer';

export interface IExchangeModalsStore {
  bundleDetails: {
    open: boolean;
    bundle: Bundle | BundlePublicDTO;
    isOwner?: boolean;
  };
}

interface IShowBundleDetailsAction {
  type: ExchangeModalsActionsEnum.SHOW_BUNDLE_DETAILS;
  payload: {
    open: boolean;
    bundle: Bundle | BundlePublicDTO;
    isOwner?: boolean;
  };
}

export type TExchangeModalsAction = IShowBundleDetailsAction;
