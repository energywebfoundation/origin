import React, { FC } from 'react';
import { GenericModal } from '@energyweb/origin-ui-core';
import { ErrorOutline } from '@material-ui/icons';
import { useStyles } from './RemoveSupplyConfirmModal.styles';
import { useRemoveSupplyConfirmModalEffects } from './RemoveSupplyConfirmModal.effects';

interface RemoveSupplyConfirmModalProps {}

export const RemoveSupplyConfirmModal: FC<RemoveSupplyConfirmModalProps> =
  () => {
    const classes = useStyles();
    const { open, title, text, buttons, dialogProps } =
      useRemoveSupplyConfirmModalEffects();
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
