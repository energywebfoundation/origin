import React from 'react';

import { useStyles } from '../user-settings-page/UserSettingsPage.styles';
import { Paper } from '@material-ui/core';
import UpdateUserDataContainer from '../../containers/update-user-data-container/UpdateUserDataContainer';
import UpdateUserEmailContainer from '../../containers/update-user-email/UpdateUserEmailContainer';
import UpdateUserPasswordContainer from '../../containers/update-user-password-container/UpdateUserPasswordContainer';
import UserBlochainAdressesContainer from '../../containers/user-blochain-adresses-container/UserBlochainAdressesContainer';
import { useUserAccountPageEffects } from './UserAccountPage.effects';

/* eslint-disable-next-line */
export interface UserAccountPageProps {}

export function UserAccountPage(props: UserAccountPageProps) {
  const classes = useStyles();
  const { userAccountData } = useUserAccountPageEffects();
  return userAccountData ? (
    <>
      <Paper className={classes.paper}>
        <UpdateUserDataContainer userAccountData={userAccountData} />
      </Paper>
      <Paper className={classes.paper}>
        <UpdateUserEmailContainer userAccountData={userAccountData} />
      </Paper>
      <Paper className={classes.paper}>
        <UpdateUserPasswordContainer user={userAccountData} />
      </Paper>
      <Paper className={classes.paper}>
        <UserBlochainAdressesContainer user={userAccountData} />
      </Paper>
    </>
  ) : (
    <div>Loading</div>
  );
}

export default UserAccountPage;
