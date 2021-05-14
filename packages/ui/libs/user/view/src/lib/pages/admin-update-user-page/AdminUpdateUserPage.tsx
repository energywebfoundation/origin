import React from 'react';
import { useStyles } from '../sign-in-page/SignInPage.styles';
import { Paper } from '@material-ui/core';
import { GenericForm } from '@energyweb/origin-ui-core';
import { useAdminUpdateUserPageEffects } from './AdminUpdateUserPage.effects';
import { UserDTO } from '@energyweb/origin-backend-react-query-client';

/* eslint-disable-next-line */
export interface AdminUpdateUserPageProps {
  userId: number;
  userData: UserDTO;
}

export const AdminUpdateUserPage = ({
  userId,
  userData,
}: AdminUpdateUserPageProps) => {
  const classes = useStyles();
  const { formConfig } = useAdminUpdateUserPageEffects(userId);
  return (
    <Paper className={classes.paper}>
      <GenericForm {...formConfig} initialValues={userData} />
    </Paper>
  );
};

export default AdminUpdateUserPage;
