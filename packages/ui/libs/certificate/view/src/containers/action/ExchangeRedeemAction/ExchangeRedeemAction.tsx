import { AccountAssetDTO } from '@energyweb/exchange-react-query-client';
import {
  ListActionComponentProps,
  FormDatePicker,
  FormInput,
  FormSelect,
} from '@energyweb/origin-ui-core';
import { CircularProgress, Grid, Box, Tooltip } from '@mui/material';
import { isEmpty } from 'lodash';
import React, { PropsWithChildren, ReactElement } from 'react';
import { CertificateActionContent } from '../../list';
import { useExchangeRedeemActionEffects } from './ExchangeRedeemAction.effects';

type ExchangeRedeemActionProps = ListActionComponentProps<
  AccountAssetDTO['asset']['id']
>;

export type TExchangeRedeemAction = (
  props: PropsWithChildren<ExchangeRedeemActionProps>
) => ReactElement;

export const ExchangeRedeemAction: TExchangeRedeemAction = ({
  selectedIds,
  resetIds,
}) => {
  const {
    title,
    buttonText,
    selectedItems,
    redeemHandler,
    isLoading,
    buttonDisabled,
    fields,
    register,
    control,
    errors,
    selectDisabled,
    selectDisabledTooltip,
  } = useExchangeRedeemActionEffects(selectedIds, resetIds);

  if (isLoading) return <CircularProgress />;

  return (
    <CertificateActionContent
      disableBulkActions
      title={title}
      buttonText={buttonText}
      selectedIds={selectedIds}
      selectedItems={selectedItems}
      submitHandler={redeemHandler}
      buttonDisabled={buttonDisabled}
    >
      <Tooltip
        placement="top"
        title={selectDisabled ? selectDisabledTooltip : ''}
      >
        <div>
          <FormSelect
            disabled={selectDisabled}
            control={control}
            field={fields[0]}
            errorExists={!isEmpty(errors[fields[0].name])}
            errorText={(errors[fields[0].name] as any)?.message ?? ''}
          />
        </div>
      </Tooltip>
      <Grid container spacing={1} sx={{ marginBottom: '10px' }}>
        <Grid item xs={6}>
          <FormDatePicker
            control={control}
            field={fields[1]}
            errorExists={!isEmpty(errors[fields[1].name])}
            errorText={(errors[fields[1].name] as any)?.message ?? ''}
          />
        </Grid>
        <Grid item xs={6}>
          <FormDatePicker
            control={control}
            field={fields[2]}
            errorExists={!isEmpty(errors[fields[2].name])}
            errorText={(errors[fields[2].name] as any)?.message ?? ''}
          />
        </Grid>
      </Grid>
      <Box mb={2}>
        <FormInput
          register={register}
          field={fields[3]}
          errorExists={!isEmpty(errors[fields[3].name])}
          errorText={(errors[fields[3].name] as any)?.message ?? ''}
        />
      </Box>
    </CertificateActionContent>
  );
};
