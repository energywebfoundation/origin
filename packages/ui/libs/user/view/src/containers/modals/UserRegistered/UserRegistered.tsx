import { GenericModal } from '@energyweb/origin-ui-core';
import { HowToReg } from '@material-ui/icons';
import React from 'react';
import { useUserRegisteredEffects } from './UserRegistered.effects';
import { useStyles } from './UserRegistered.styles';

export const UserRegistered = () => {
  const classes = useStyles();
  const { open, title, text, buttons, dialogProps } =
    useUserRegisteredEffects();

  return (
    <GenericModal
      open={open}
      title={title}
      text={text}
      buttons={buttons}
      dialogProps={dialogProps}
      icon={<HowToReg className={classes.icon} />}
    />
  );
};
