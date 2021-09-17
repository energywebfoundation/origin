import { GenericForm } from '@energyweb/origin-ui-core';
import { CircularProgress, Paper } from '@material-ui/core';
import React from 'react';
import { useStyles } from './AdminUpdateUserPage.styles';
import { useAdminUpdateUserPageEffects } from './AdminUpdateUserPage.effects';

export const AdminUpdateUserPage = () => {
  const { formProps, isLoading } = useAdminUpdateUserPageEffects();
  const classes = useStyles();

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Paper className={classes.paper}>
      <GenericForm {...formProps} />
    </Paper>
  );
};
