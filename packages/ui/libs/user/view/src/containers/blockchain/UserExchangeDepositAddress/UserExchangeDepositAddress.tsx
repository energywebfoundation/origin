import React, { FC } from 'react';
import { CircularProgress, Grid, TextField, Typography } from '@mui/material';
import { Info } from '@mui/icons-material';
import { IconPopover, IconSize } from '@energyweb/origin-ui-core';
import { useStyles } from './UserExchangeDepositAddress.styles';
import { useUserExchangeDepositAddressEffects } from './UserExchangeDepositAddress.effects';

export const UserExchangeDepositAddress: FC = () => {
  const { exchangeAddress, isLoading, title, popoverText } =
    useUserExchangeDepositAddressEffects();
  const classes = useStyles({
    exchangeAddressExists: Boolean(exchangeAddress),
  });

  if (isLoading) return <CircularProgress />;

  return (
    <Grid item md={8} xs={12} className={classes.gridContainer}>
      <Typography variant="h6" component="span">
        {title}
      </Typography>
      {!exchangeAddress ? (
        <IconPopover
          icon={Info}
          iconSize={IconSize.Large}
          popoverText={popoverText}
          className={classes.iconPopover}
          iconProps={{ ['data-cy']: 'exchange-address-info-icon' }}
        />
      ) : null}
      {exchangeAddress ? (
        <div className={classes.fieldWrapper}>
          <TextField
            value={exchangeAddress}
            disabled={true}
            variant="filled"
            className={classes.field}
            inputProps={{ ['data-cy']: 'exchange-deposit-address' }}
          />
          <IconPopover
            icon={Info}
            iconSize={IconSize.Large}
            popoverText={popoverText}
            className={classes.iconPopover}
            iconProps={{ ['data-cy']: 'exchange-address-info-icon' }}
          />
        </div>
      ) : null}
    </Grid>
  );
};
