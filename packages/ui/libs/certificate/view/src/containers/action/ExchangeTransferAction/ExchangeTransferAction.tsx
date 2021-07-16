import { ListActionComponentProps } from '@energyweb/origin-ui-core';
import { TextField } from '@material-ui/core';
import React, { PropsWithChildren, ReactElement } from 'react';
import { CertificateActionContent } from '../../list';
import { useExchangeTransferActionPropsEffects } from './ExchangeTransferAction.effects';
import { useStyles } from './ExchangeTransferAction.styles';

interface ExchangeTransferActionProps<Id>
  extends ListActionComponentProps<Id> {}

export type TExchangeTransferAction = <Id>(
  props: PropsWithChildren<ExchangeTransferActionProps<Id>>
) => ReactElement;

export const ExchangeTransferAction: TExchangeTransferAction = ({
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
    buttonDisabled,
  } = useExchangeTransferActionPropsEffects(selectedIds, resetIds);

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
