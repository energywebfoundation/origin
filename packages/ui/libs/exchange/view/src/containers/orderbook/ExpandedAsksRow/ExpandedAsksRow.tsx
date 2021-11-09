import { OrderBookOrderDTO } from '@energyweb/exchange-irec-react-query-client';
import { SmallTitleWithText } from '@energyweb/origin-ui-core';
import { Box, CircularProgress, Grid } from '@mui/material';
import React, { FC } from 'react';
import { useExpandedAsksRowEffects } from './ExpandedAsksRow.effects';

interface ExpandedAsksRow {
  id: OrderBookOrderDTO['id'];
}

export const ExpandedAsksRow: FC<ExpandedAsksRow> = ({ id }) => {
  const {
    isLoading,
    facilityName,
    constructed,
    fuelDeviceType,
    generationFrom,
    generationTo,
  } = useExpandedAsksRowEffects(id);

  if (isLoading) return <CircularProgress />;

  return (
    <Box>
      <Grid container>
        <Grid item xs={12} sm={6}>
          <SmallTitleWithText {...facilityName} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <SmallTitleWithText {...constructed} />
        </Grid>
      </Grid>
      <Grid container sx={{ my: { sm: 2 } }}>
        <SmallTitleWithText {...fuelDeviceType} />
      </Grid>
      <Grid container>
        <Grid item xs={12} sm={6}>
          <SmallTitleWithText {...generationFrom} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <SmallTitleWithText {...generationTo} />
        </Grid>
      </Grid>
    </Box>
  );
};
