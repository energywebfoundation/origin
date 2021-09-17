import { AccountAssetDTO } from '@energyweb/exchange-react-query-client';
import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import {
  ItemsListWithActionsProps,
  ListAction,
  TItemsListWithActionsContainers,
} from '@energyweb/origin-ui-core';
import { ComposedPublicDevice } from '@energyweb/origin-ui-exchange-data';
import { FC } from 'react';

export interface ListItemContentProps {
  icon: FC<React.SVGProps<SVGSVGElement>>;
  fuelType: string;
  energy: string;
  certificationDateTitle: string;
  certificationDateText: string;
}
type TUseCreateBundleLogicArgs = {
  exchangeCertificates: AccountAssetDTO[];
  allDevices: ComposedPublicDevice[];
  allFuelTypes: CodeNameDTO[];
  actions: ListAction[];
  ListItemHeader: React.FC<{ name: string; country: string }>;
  ListItemContent: React.FC<ListItemContentProps>;
};

export type TUseCreateBundleLogic = (
  args: TUseCreateBundleLogicArgs
) => ItemsListWithActionsProps<
  ComposedPublicDevice['externalRegistryId'],
  AccountAssetDTO['asset']['id']
>;

export type CreateBundleContainers = TItemsListWithActionsContainers<
  ComposedPublicDevice['externalRegistryId'],
  AccountAssetDTO['asset']['id']
>;

type TFormatSelectedExchangeItemsArgs<Id> = {
  selectedIds: Id[];
  exchangeCertificates: AccountAssetDTO[];
  allDevices: ComposedPublicDevice[];
  allFuelTypes: CodeNameDTO[];
};

export type SelectedItem<Id> = {
  id: Id;
  icon: FC<React.SVGProps<SVGSVGElement>>;
  deviceName: string;
  energy: string;
  generationTime: string;
};

export type TFormatSelectedExchangeItems = <Id>(
  args: TFormatSelectedExchangeItemsArgs<Id>
) => SelectedItem<Id>[];

type TUseSellAsBundleActionLogicArgs<Id> = {
  selectedIds: Id[];
  exchangeCertificates: AccountAssetDTO[];
  allDevices: ComposedPublicDevice[];
  allFuelTypes: CodeNameDTO[];
};

export type TUseSellAsBundleActionLogic<Id> = (
  args: TUseSellAsBundleActionLogicArgs<Id>
) => {
  title: string;
  buttonText: string;
  priceInputLabel: string;
  totalPriceText: string;
  selectedItems: SelectedItem<Id>[];
};
