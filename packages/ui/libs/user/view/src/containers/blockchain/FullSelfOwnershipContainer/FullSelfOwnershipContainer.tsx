import { IconPopover, IconSize } from '@energyweb/origin-ui-core';
import { Info } from '@mui/icons-material';
import { Switch, Typography, Grid } from '@mui/material';
import React, { FC } from 'react';
import { useFullSelfOwnershipContainerEffects } from './FullSelfOwnershipContainer.effects';
import { useStyles } from './FullSelfOwnershipContainer.styles';

export const FullSelfOwnershipContainer: FC = () => {
  const {
    fullOwnership,
    toggleOwnership,
    fieldLabel,
    popoverText,
    switchDisabled,
  } = useFullSelfOwnershipContainerEffects();
  const classes = useStyles();

  return (
    <Grid item md={8} xs={12} className={classes.wrapper}>
      <Switch
        checked={fullOwnership}
        onChange={toggleOwnership}
        disabled={switchDisabled}
      />
      <Typography variant="h6" component="span">
        {fieldLabel}
      </Typography>
      <IconPopover
        icon={Info}
        iconSize={IconSize.Large}
        popoverText={popoverText}
        className={classes.iconPopover}
      />
    </Grid>
  );
};
