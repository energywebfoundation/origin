import React from 'react';

import { useStyles } from '../user-settings-page/UserSettingsPage.styles';
import { Grid, Paper } from '@material-ui/core';
import {
  UpdateUserEmailContainer,
  UserResendConfirmationEmailContainer,
  UpdateUserDataContainer,
  UpdateUserPasswordContainer,
  UserBlockchainAddressesContainer,
} from '../../containers';

import { useUserAccountPageEffects } from './UserAccountPage.effects';

/* eslint-disable-next-line */
export interface UserAccountPageProps {}

export const UserAccountPage = () => {
  const classes = useStyles();
  const { userAccountData } = useUserAccountPageEffects();
  return userAccountData ? (
    <Grid item xs={12} className={classes.wrapper}>
      <Grid container spacing={3}>
        <Grid xs={12} item>
          <Paper classes={{ root: classes.paper }}>
            {userAccountData.email && !userAccountData.emailConfirmed && (
              <UserResendConfirmationEmailContainer />
            )}
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
            <UserBlockchainAddressesContainer />
          </Paper>
        </Grid>
      </Grid>
    </Grid>
  ) : (
    <div>Loading</div>
  );
};

export default UserAccountPage;
