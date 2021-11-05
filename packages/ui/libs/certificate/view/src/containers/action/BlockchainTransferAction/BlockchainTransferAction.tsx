import { CertificateDTO } from '@energyweb/issuer-irec-api-react-query-client';
import { ListActionComponentProps } from '@energyweb/origin-ui-core';
import { withMetamask } from '@energyweb/origin-ui-web3';
import { CircularProgress, TextField } from '@mui/material';
import React, { PropsWithChildren, ReactElement } from 'react';
import { CertificateActionContent } from '../../list';
import { ConnectMetamaskBlockchainInbox } from '../../metamask';
import { useBlockchainTransferActionEffects } from './BlockchainTransferAction.effects';
import { useStyles } from './BlockchainTransferAction.styles';

type BlockchainTransferActionProps = ListActionComponentProps<
  CertificateDTO['id']
>;

export type TBlockchainTransferAction = <Id>(
  props: PropsWithChildren<BlockchainTransferActionProps>
) => ReactElement;

const Component: TBlockchainTransferAction = ({ selectedIds, resetIds }) => {
  const classes = useStyles();
  const {
    title,
    buttonText,
    addressInputLabel,
    selectedItems,
    transferHandler,
    recipientAddress,
    handleAddressChange,
    isLoading,
    buttonDisabled,
    errorExists,
    errorText,
  } = useBlockchainTransferActionEffects(selectedIds, resetIds);

  if (isLoading) return <CircularProgress />;

  return (
    <CertificateActionContent
      title={title}
      buttonText={buttonText}
      selectedIds={selectedIds}
      selectedItems={selectedItems}
      submitHandler={transferHandler}
      buttonDisabled={buttonDisabled}
    >
      <TextField
        fullWidth
        required
        className={classes.input}
        variant="filled"
        label={addressInputLabel}
        margin="none"
        onChange={handleAddressChange}
        value={recipientAddress}
        error={errorExists}
        helperText={errorExists ? errorText : ''}
      />
    </CertificateActionContent>
  );
};

export const BlockchainTransferAction = withMetamask(
  Component,
  ConnectMetamaskBlockchainInbox
);
