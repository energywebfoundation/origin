import { ComposedPublicDevice } from '@energyweb/origin-ui-device-data';
import { Grid, Paper, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { SmartMeterChart } from '../SmartMeterChart';
import { SmartMeterTable } from '../SmartMeterTable';
import { useStyles } from './SmartMeterBlock.styles';

interface SmartMeterBlockProps {
  device: ComposedPublicDevice;
}

export const SmartMeterBlock: FC<SmartMeterBlockProps> = ({ device }) => {
  const classes = useStyles();
  return (
    <Paper className={classes.paper}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <SmartMeterTable device={device} />
        </Grid>

        <Grid item xs={12} md={8}>
          <SmartMeterChart meterId={device.smartMeterId} />
        </Grid>
      </Grid>
    </Paper>
  );
};
