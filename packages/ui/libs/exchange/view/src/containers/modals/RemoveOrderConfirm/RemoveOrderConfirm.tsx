import React, { FC } from 'react';
import { GenericModal } from '@energyweb/origin-ui-core';
import { ErrorOutline } from '@material-ui/icons';
import { useStyles } from './RemoveOrderConfirm.styles';
import { useRemoveOrderConfirmEffects } from './RemoveOrderConfirm.effects';

export const RemoveOrderConfirm: FC = () => {
  const classes = useStyles();
  const {
    open,
    title,
    text,
    buttons,
    dialogProps,
  } = useRemoveOrderConfirmEffects();
  return (
    <GenericModal
      icon={<ErrorOutline className={classes.icon} />}
      dialogProps={dialogProps}
      open={open}
      title={title}
      text={text}
      buttons={buttons}
    />
  );
};
