import { ListActionComponentProps } from '@energyweb/origin-ui-core';
import { CircularProgress, TextField } from '@material-ui/core';
import React, { PropsWithChildren, ReactElement } from 'react';
import { CertificateActionContent } from '../../list';
import { useBlockchainTransferActionEffects } from './BlockchainTransferAction.effects';
import { useStyles } from './BlockchainTransferAction.styles';

type BlockchainTransferActionProps<Id> = ListActionComponentProps<Id>;

export type TBlockchainTransferAction = <Id>(
  props: PropsWithChildren<BlockchainTransferActionProps<Id>>
) => ReactElement;

export const BlockchainTransferAction: TBlockchainTransferAction = ({
  selectedIds,
  resetIds,
}) => {
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
