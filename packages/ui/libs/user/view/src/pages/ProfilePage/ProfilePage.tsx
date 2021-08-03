import React from 'react';

import { CircularProgress, Grid, Paper } from '@material-ui/core';
import {
  UpdateUserData,
  UpdateUserEmail,
  UpdateUserPassword,
  BlockchainAddressesContainer,
} from '../../containers';
import { useStyles } from './ProfilePage.styles';
import { useProfilePageEffects } from './ProfilePage.effects';

export const ProfilePage = () => {
  const classes = useStyles();
  const { user, userLoading } = useProfilePageEffects();

  if (userLoading) {
    return <CircularProgress />;
  }

  return (
    <Grid item xs={12} className={classes.wrapper}>
      <Grid container spacing={3}>
        <Grid xs={12} item>
          <Paper classes={{ root: classes.paper }}>
            <UpdateUserData userAccountData={user} />
          </Paper>
        </Grid>
        <Grid xs={12} item>
          <Paper classes={{ root: classes.paper }}>
            <UpdateUserEmail userAccountData={user} />
          </Paper>
        </Grid>
        <Grid xs={12} item>
          <Paper classes={{ root: classes.paper }}>
            <UpdateUserPassword />
          </Paper>
        </Grid>
        <Grid xs={12} item>
          <Paper classes={{ root: classes.paper }}>
            <BlockchainAddressesContainer />
          </Paper>
        </Grid>
      </Grid>
    </Grid>
  );
};
