import { GenericModal } from '@energyweb/origin-ui-core';
import { MailOutline } from '@material-ui/icons';
import React from 'react';
import { usePendingInvitationEffects } from './PendingInvitation.effects';
import { useStyles } from './PendingInvitation.styles';

export const PendingInvitation = () => {
  const classes = useStyles();
  const {
    open,
    title,
    text,
    buttons,
    dialogProps,
  } = usePendingInvitationEffects();
  return (
    <GenericModal
      open={open}
      title={title}
      text={text}
      buttons={buttons}
      dialogProps={dialogProps}
      icon={<MailOutline className={classes.icon} />}
    />
  );
};
