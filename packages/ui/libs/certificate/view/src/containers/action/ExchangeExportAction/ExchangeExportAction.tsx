import { AccountAssetDTO } from '@energyweb/exchange-react-query-client';
import { ListActionComponentProps } from '@energyweb/origin-ui-core';
import { TextField, Typography } from '@mui/material';
import React, { PropsWithChildren, ReactElement } from 'react';
import { CertificateActionContent } from '../../list';
import { useExchangeExportActionEffects } from './ExchangeExportAction.effects';

type ExchangeExportActionProps = ListActionComponentProps<
  AccountAssetDTO['asset']['id']
>;

export type TExchangeExportAction = (
  props: PropsWithChildren<ExchangeExportActionProps>
) => ReactElement;

export const ExchangeExportAction: TExchangeExportAction = ({
  selectedIds,
  resetIds,
}) => {
  const {
    title,
    buttonText,
    addressInputLabel,
    inputHeader,
    selectedItems,
    transferHandler,
    recipientTradeAccount,
    handleAddressChange,
    buttonDisabled,
    errorExists,
    errorText,
  } = useExchangeExportActionEffects(selectedIds, resetIds);

  return (
    <CertificateActionContent
      disableBulkActions
      title={title}
      buttonText={buttonText}
      selectedIds={selectedIds}
      selectedItems={selectedItems}
      submitHandler={transferHandler}
      buttonDisabled={buttonDisabled}
    >
      <>
        <Typography color="textSecondary" gutterBottom>
          {inputHeader}
        </Typography>
        <TextField
          fullWidth
          required
          variant="filled"
          label={addressInputLabel}
          margin="none"
          onChange={handleAddressChange}
          value={recipientTradeAccount}
          error={errorExists}
          helperText={errorExists ? errorText : ''}
          sx={{ marginBottom: '20px' }}
        />
      </>
    </CertificateActionContent>
  );
};
