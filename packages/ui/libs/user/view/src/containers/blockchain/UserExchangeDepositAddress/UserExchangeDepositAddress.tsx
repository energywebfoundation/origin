import React, { FC } from 'react';
import {
  Button,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from '@material-ui/core';
import { IconPopover, IconSize } from '@energyweb/origin-ui-core';
import { useStyles } from './UserExchangeDepositAddress.styles';
import { useUserExchangeDepositAddressEffects } from './UserExchangeDepositAddress.effects';
import { Info } from '@material-ui/icons';

export const UserExchangeDepositAddress: FC = () => {
  const classes = useStyles();
  const {
    isCreating,
    submitHandler,
    exchangeAddress,
    isLoading,
    title,
    buttonText,
    popoverText,
  } = useUserExchangeDepositAddressEffects();

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Grid item md={8} xs={12} className={classes.gridContainer}>
      <Typography variant="h6">{title}</Typography>
      <div className={classes.fieldWrapper}>
        {exchangeAddress ? (
          <TextField
            value={exchangeAddress}
            disabled={true}
            variant="filled"
            className={classes.field}
          />
        ) : (
          <>
            <Button
              type="button"
              variant="contained"
              color="primary"
              disabled={isCreating}
              onClick={submitHandler}
            >
              {buttonText}
            </Button>
            {isCreating && <CircularProgress className={classes.loader} />}
          </>
        )}
        <IconPopover
          icon={Info}
          iconSize={IconSize.Large}
          popoverText={popoverText}
          className={classes.iconPopover}
        />
      </div>
    </Grid>
  );
};
