import React, { FC } from 'react';
import { TableComponent } from '@energyweb/origin-ui-core';
import { ComposedPublicDevice } from '@energyweb/origin-ui-device-data';
import { useSmartMeterTableEffects } from './SmartMeterTable.effects';
import { Typography } from '@material-ui/core';
import { useStyles } from './SmartMeterTable.styles';

interface SmartMeterTableProps {
  device: ComposedPublicDevice;
}

export const SmartMeterTable: FC<SmartMeterTableProps> = ({ device }) => {
  const tableProps = useSmartMeterTableEffects(device);
  const classes = useStyles();
  return (
    <div className={classes.wrapper}>
      <Typography variant="h5" gutterBottom>
        Smart Meter Readings
      </Typography>
      <TableComponent {...tableProps} />
    </div>
  );
};
