import { CertificateDTO } from '@energyweb/issuer-irec-api-react-query-client';
import { ListActionComponentProps } from '@energyweb/origin-ui-core';
import { withMetamask } from '@energyweb/origin-ui-web3';
import { CircularProgress } from '@mui/material';
import React, { PropsWithChildren, ReactElement } from 'react';
import { CertificateActionContent } from '../../list';
import { ConnectMetamaskBlockchainInbox } from '../../metamask';
import { useDepositActionEffects } from './DepositAction.effects';

type DepositActionProps = ListActionComponentProps<CertificateDTO['id']>;

export type TDepositAction = (
  props: PropsWithChildren<DepositActionProps>
) => ReactElement;

const Component: TDepositAction = ({ selectedIds, resetIds }) => {
  const { title, buttonText, selectedItems, depositHandler, isLoading } =
    useDepositActionEffects(selectedIds, resetIds);

  if (isLoading) return <CircularProgress />;

  return (
    <CertificateActionContent
      title={title}
      buttonText={buttonText}
      selectedIds={selectedIds}
      selectedItems={selectedItems}
      submitHandler={depositHandler}
    />
  );
};

export const DepositAction = withMetamask(
  Component,
  ConnectMetamaskBlockchainInbox
);
