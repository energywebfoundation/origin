import { GenericModal } from '@energyweb/origin-ui-core';
import { AccountBalanceWallet } from '@material-ui/icons';
import React from 'react';
import { useCreateExchangeAddressEffects } from './CreateExchangeAddress.effects';
import { useStyles } from './CreateExchangeAddress.styles';

export const CreateExchangeAddress: React.FC = () => {
  const classes = useStyles();
  const {
    open,
    title,
    text,
    buttons,
    dialogProps,
  } = useCreateExchangeAddressEffects();
  return (
    <GenericModal
      open={open}
      title={title}
      text={text}
      buttons={buttons}
      dialogProps={dialogProps}
      icon={<AccountBalanceWallet className={classes.icon} />}
    />
  );
};
