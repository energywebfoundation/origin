import React, { FC } from 'react';
import {
  Button,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { Info } from '@mui/icons-material';
import { IconPopover, IconSize } from '@energyweb/origin-ui-core';
import { withMetamask } from '@energyweb/origin-ui-web3';
import { ConnectMetamaskPlaceholder } from '../ConnectMetamaskPlaceholder';
import { useOrganizationBlockchainAddressEffects } from './OrganizationBlockchainAddress.effects';
import { useStyles } from './OrganizationBlockchainAddress.styles';

const Component: FC = () => {
  const classes = useStyles();
  const {
    submitHandler,
    isLoading,
    blockchainAddress,
    isUpdating,
    title,
    buttonText,
    popoverText,
  } = useOrganizationBlockchainAddressEffects();

  if (isLoading) return <CircularProgress />;

  return (
    <Grid item md={8} xs={12}>
      <Typography variant="h6" component="span">
        {title}
      </Typography>
      <div className={classes.fieldWrapper}>
        {blockchainAddress ? (
          <TextField
            value={blockchainAddress}
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
              disabled={isUpdating}
              onClick={submitHandler}
            >
              {buttonText}
            </Button>
            {isUpdating && <CircularProgress className={classes.loader} />}
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

export const OrganizationBlockchainAddress = withMetamask(
  Component,
  ConnectMetamaskPlaceholder
);

export const getOrganizationBlockchainAddressComponent = (
  isAddressAttached: boolean
) => {
  const component = isAddressAttached
    ? Component
    : OrganizationBlockchainAddress;
  return component;
};
