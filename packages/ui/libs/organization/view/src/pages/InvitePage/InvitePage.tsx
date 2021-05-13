import React, { FC } from 'react';
import { Paper } from '@material-ui/core';
import { GenericForm } from '@energyweb/origin-ui-core';
import { useStyles } from './InvitePage.styles';
import { useInvitePageEffects } from './InvitePage.effects';

export const InvitePage: FC = () => {
  const { formData } = useInvitePageEffects();

  const classes = useStyles();
  return (
    <Paper className={classes.paper}>
      <GenericForm
        inputsVariant="filled"
        twoColumns
        buttonWrapperProps={{
          mt: 1,
          mb: 0,
          mx: 2,
          justifyContent: 'flex-start',
        }}
        {...formData}
      />
    </Paper>
  );
};
