import React, { FC } from 'react';
import {
  Button,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from '@material-ui/core';
import { useOrganizationBlockchainAddressEffects } from './OrganizationBlockchainAddress.effects';
import { IconPopover, IconSize } from '@energyweb/origin-ui-core';
import { Info } from '@material-ui/icons';
import { useStyles } from './OrganizationBlockchainAddress.styles';
import { withMetamask } from '@energyweb/origin-ui-blockchain';

const Component: FC = () => {
  const {
    submitHandler,
    isLoading,
    blockchainAddress,
    isUpdating,
    title,
    buttonText,
    popoverText,
  } = useOrganizationBlockchainAddressEffects();

  if (isLoading) {
    return <CircularProgress />;
  }

  const classes = useStyles();

  return (
    <Grid item md={8} xs={12}>
      <Typography variant="h6">{title}</Typography>
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

export const OrganizationBlockchainAddress = withMetamask(Component);
