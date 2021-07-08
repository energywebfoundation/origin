import { AccountAssetDTO } from '@energyweb/exchange-react-query-client';
import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { ComposedDevice } from '@energyweb/origin-ui-certificate-data';
import {
  ItemsListWithActionsProps,
  ListAction,
  TItemsListWithActionsContainers,
} from '@energyweb/origin-ui-core';
import React, { FC } from 'react';

type TUseExchangeInboxLogicArgs = {
  exchangeCertificates: AccountAssetDTO[];
  myDevices: ComposedDevice[];
  allFuelTypes: CodeNameDTO[];
  actions: ListAction[];
  ListItemHeader: React.FC<{ name: string; country: string }>;
  ListItemContent: React.FC<{
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    fuelType: string;
    energy: string;
    generationTimeTitle: string;
    generationTimeText: string;
    viewButtonLabel: string;
  }>;
};

export type TUseExchangeInboxLogic = (
  args: TUseExchangeInboxLogicArgs
) => ItemsListWithActionsProps<
  ComposedDevice['externalRegistryId'],
  AccountAssetDTO['asset']['id']
>;

export type ExchangeInboxContainers = TItemsListWithActionsContainers<
  ComposedDevice['externalRegistryId'],
  AccountAssetDTO['asset']['id']
>;

export type SelectedItem<Id> = {
  id: Id;
  icon: FC<React.SVGProps<SVGSVGElement>>;
  deviceName: string;
  energy: string;
  generationTime: string;
};

type TUseSellActionLogicArgs<Id> = {
  selectedIds: Id[];
  exchangeCertificates: AccountAssetDTO[];
  myDevices: ComposedDevice[];
  allFuelTypes: CodeNameDTO[];
};

export type TUseSellActionLogic = <Id>(args: TUseSellActionLogicArgs<Id>) => {
  title: string;
  buttonText: string;
  priceInputLabel: string;
  totalPriceText: string;
  selectedItems: SelectedItem<Id>[];
};

type TUseWithdrawActionLogicArgs<Id> = {
  selectedIds: Id[];
  exchangeCertificates: AccountAssetDTO[];
  myDevices: ComposedDevice[];
  allFuelTypes: CodeNameDTO[];
};

export type TUseWithdrawActionLogic = <Id>(
  args: TUseWithdrawActionLogicArgs<Id>
) => {
  title: string;
  buttonText: string;
  selectedItems: SelectedItem<Id>[];
};
