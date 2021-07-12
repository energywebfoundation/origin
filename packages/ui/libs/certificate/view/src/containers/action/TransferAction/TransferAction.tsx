import { ListActionComponentProps } from '@energyweb/origin-ui-core';
import { CircularProgress, TextField } from '@material-ui/core';
import React, { PropsWithChildren, ReactElement } from 'react';
import { CertificateActionContent } from '../../list';
import { useTransferActionEffects } from './TransferAction.effects';
import { useStyles } from './TransferAction.styles';

interface TransferActionProps<Id> extends ListActionComponentProps<Id> {}

export type TTransferAction = <Id>(
  props: PropsWithChildren<TransferActionProps<Id>>
) => ReactElement;

export const TransferAction: TTransferAction = ({ selectedIds, resetIds }) => {
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
  } = useTransferActionEffects(selectedIds, resetIds);

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
      />
    </CertificateActionContent>
  );
};
