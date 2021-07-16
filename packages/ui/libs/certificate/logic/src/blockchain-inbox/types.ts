import { CertificateDTO } from '@energyweb/issuer-irec-api-react-query-client';
import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { BeneficiaryDTO } from '@energyweb/origin-organization-irec-api-react-query-client';
import { ComposedPublicDevice } from '@energyweb/origin-ui-certificate-data';
import {
  ItemsListWithActionsProps,
  ListAction,
  SelectRegularProps,
  TItemsListWithActionsContainers,
} from '@energyweb/origin-ui-core';
import React, { FC } from 'react';

export interface ListItemContentProps<Id> {
  certificateId: Id;
  icon: FC<React.SVGProps<SVGSVGElement>>;
  fuelType: string;
  energy: string;
  generationTimeTitle: string;
  generationTimeText: string;
  viewButtonLabel: string;
}

export type TListItemContent = <Id>(
  props: React.PropsWithChildren<ListItemContentProps<Id>>
) => React.ReactElement;

type TUseBlockchainInboxLogicArgs = {
  blockchainCertificates: CertificateDTO[];
  allDevices: ComposedPublicDevice[];
  allFuelTypes: CodeNameDTO[];
  actions: ListAction[];
  ListItemHeader: React.FC<{ name: string; country: string }>;
  ListItemContent: TListItemContent;
};

export type TUseBlockchainInboxLogic = (
  args: TUseBlockchainInboxLogicArgs
) => ItemsListWithActionsProps<
  ComposedPublicDevice['externalRegistryId'],
  CertificateDTO['id']
>;

export type BlockchainInboxContainers = TItemsListWithActionsContainers<
  ComposedPublicDevice['externalRegistryId'],
  CertificateDTO['id']
>;

export type SelectedItem<Id> = {
  id: Id;
  icon: FC<React.SVGProps<SVGSVGElement>>;
  deviceName: string;
  energy: string;
  generationTime: string;
};

type TUseDepositActionLogicArgs<Id> = {
  selectedIds: Id[];
  blockchainCertificates: CertificateDTO[];
  allDevices: ComposedPublicDevice[];
  allFuelTypes: CodeNameDTO[];
};

export type TUseDepositActionLogic = <Id>(
  args: TUseDepositActionLogicArgs<Id>
) => {
  title: string;
  buttonText: string;
  selectedItems: SelectedItem<Id>[];
};

type TUseRetireActionLogicArgs<Id> = {
  selectedIds: Id[];
  blockchainCertificates: CertificateDTO[];
  allDevices: ComposedPublicDevice[];
  allFuelTypes: CodeNameDTO[];
};

export type TUseRetireActionLogic = <Id>(
  args: TUseRetireActionLogicArgs<Id>
) => {
  title: string;
  buttonText: string;
  selectedItems: SelectedItem<Id>[];
};

export type TUseBeneficiariesSelectorLogic = (
  allBeneficiaries: BeneficiaryDTO[],
  setSelectedBeneficiary: React.Dispatch<
    React.SetStateAction<BeneficiaryDTO['irecBeneficiaryId']>
  >
) => Omit<SelectRegularProps, 'value'>;

type TUseBlockchainTransferActionLogicArgs<Id> = {
  selectedIds: Id[];
  blockchainCertificates: CertificateDTO[];
  allDevices: ComposedPublicDevice[];
  allFuelTypes: CodeNameDTO[];
};

export type TUseBlockchainTransferActionLogic = <Id>(
  args: TUseBlockchainTransferActionLogicArgs<Id>
) => {
  title: string;
  buttonText: string;
  addressInputLabel: string;
  selectedItems: SelectedItem<Id>[];
};

type FormatSelectedBlockchainItemsArgs<Id> = {
  selectedIds: Id[];
  blockchainCertificates: CertificateDTO[];
  allDevices: ComposedPublicDevice[];
  allFuelTypes: CodeNameDTO[];
};

export type TFormatSelectedBlockchainItems = <Id>(
  args: FormatSelectedBlockchainItemsArgs<Id>
) => SelectedItem<Id>[];
