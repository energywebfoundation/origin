import { CertificateDTO } from '@energyweb/issuer-irec-api-react-query-client';
import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { BeneficiaryDTO } from '@energyweb/origin-organization-irec-api-react-query-client';
import { ComposedDevice } from '@energyweb/origin-ui-certificate-data';
import {
  ItemsListWithActionsProps,
  ListAction,
  SelectRegularProps,
  TItemsListWithActionsContainers,
} from '@energyweb/origin-ui-core';
import React, { FC } from 'react';

type TUseBlockchainInboxLogicArgs = {
  blockchainCertificates: CertificateDTO[];
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

export type TUseBlockchainInboxLogic = (
  args: TUseBlockchainInboxLogicArgs
) => ItemsListWithActionsProps<
  ComposedDevice['externalRegistryId'],
  CertificateDTO['id']
>;

export type BlockchainInboxContainers = TItemsListWithActionsContainers<
  ComposedDevice['externalRegistryId'],
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
  myDevices: ComposedDevice[];
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
  myDevices: ComposedDevice[];
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
