import React from 'react';

import { useStyles } from '../user-settings-page/UserSettingsPage.styles';
import { CircularProgress, Grid, Paper } from '@material-ui/core';
import {
  UpdateUserEmailContainer,
  UserResendConfirmationEmailContainer,
  UpdateUserDataContainer,
  UpdateUserPasswordContainer,
  UserBlockchainAddressesContainer,
} from '../../containers';

import { useUserAccountPageEffects } from './UserAccountPage.effects';

export const UserAccountPage = () => {
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
            <UserBlockchainAddressesContainer
              userAccountData={userAccountData}
            />
          </Paper>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default UserAccountPage;
