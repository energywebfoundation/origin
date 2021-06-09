import { ComposedPublicDevice } from '@energyweb/origin-ui-device-data';
import { Paper, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { SmartMeterTable } from '../SmartMeterTable';

interface SmartMeterBlockProps {
  device: ComposedPublicDevice;
}

export const SmartMeterBlock: FC<SmartMeterBlockProps> = ({ device }) => {
  return (
    <Paper style={{ padding: 20 }}>
      <div>
        <Typography variant="h5" gutterBottom>
          Smart Meter Readings
        </Typography>
      </div>
      <div>
        <SmartMeterTable device={device} />
      </div>
    </Paper>
  );
};
