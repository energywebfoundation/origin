import React, { FC } from 'react';
import { Paper, Skeleton } from '@material-ui/core';
import { GenericForm } from '@energyweb/origin-ui-core';
import { useStyles } from './InvitePage.styles';
import { useInvitePageEffects } from './InvitePage.effects';

export const InvitePage: FC = () => {
  const { formData, pageLoading, mobileView } = useInvitePageEffects();
  const classes = useStyles();

  if (pageLoading) {
    return <Skeleton height={200} width={'100%'} />;
  }

  return (
    <Paper className={classes.paper}>
      <GenericForm
        inputsVariant="filled"
        twoColumns={!mobileView}
        buttonWrapperProps={{
          justifyContent: 'flex-start',
        }}
        {...formData}
      />
    </Paper>
  );
};
