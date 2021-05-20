import React, { FC } from 'react';
import { Button, Paper, Skeleton } from '@material-ui/core';
import { GenericForm } from '@energyweb/origin-ui-core';
import { useStyles } from './InvitePage.styles';
import { useInvitePageEffects } from './InvitePage.effects';
import {
  OrganizationModalsActionsEnum,
  useOrgModalsDispatch,
  useOrgModalsStore,
} from '../../context';

export const InvitePage: FC = () => {
  const { formData, pageLoading } = useInvitePageEffects();
  const classes = useStyles();

  const dispatchModal = useOrgModalsDispatch();

  const clickHandler = () => {
    dispatchModal({
      payload: true,
      type: OrganizationModalsActionsEnum.SHOW_REGISTER_THANK_YOU,
    });
  };
  if (pageLoading) {
    return <Skeleton height={200} width={'100%'} />;
  }

  return (
    <Paper className={classes.paper}>
      <Button onClick={clickHandler}>Open modal</Button>
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
