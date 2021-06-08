import React from 'react';

import { CircularProgress, Grid, Paper } from '@material-ui/core';
import {
  UpdateUserEmailContainer,
  UpdateUserDataContainer,
  UpdateUserPasswordContainer,
  BlockchainAddressesContainer,
} from '../../containers';
import { useStyles } from './ProfilePage.styles';
import { useUserAccountPageEffects } from './ProfilePage.effects';

export const ProfilePage = () => {
  const classes = useStyles();
  const { userAccountData, isLoading } = useUserAccountPageEffects();

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Grid item xs={12} className={classes.wrapper}>
      <Grid container spacing={3}>
        <Grid xs={12} item>
          <Paper classes={{ root: classes.paper }}>
            <UpdateUserDataContainer userAccountData={userAccountData} />
          </Paper>
        </Grid>
        <Grid xs={12} item>
          <Paper classes={{ root: classes.paper }}>
            <UpdateUserEmailContainer userAccountData={userAccountData} />
          </Paper>
        </Grid>
        <Grid xs={12} item>
          <Paper classes={{ root: classes.paper }}>
            <UpdateUserPasswordContainer user={userAccountData} />
          </Paper>
        </Grid>
        <Grid xs={12} item>
          <Paper classes={{ root: classes.paper }}>
            <BlockchainAddressesContainer userAccountData={userAccountData} />
          </Paper>
        </Grid>
      </Grid>
    </Grid>
  );
};
