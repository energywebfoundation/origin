import { Box } from '@material-ui/core';
import React, { FC } from 'react';
import { StyledTitleAndText } from '../StyledTitleAndText';
import { useStyles } from './BundleDevices.styles';

interface BundleDevicesProps {
  deviceName: string;
  deviceLocation: string;
  generationTime: string;
}

export const BundleDevices: FC<BundleDevicesProps> = ({
  deviceName,
  deviceLocation,
  generationTime,
}) => {
  const classes = useStyles();
  return (
    <Box className={classes.container}>
      <Box display="flex" justifyContent="space-between">
        <StyledTitleAndText title="Facility name" text={deviceName} />
        <StyledTitleAndText title="Generation time" text={generationTime} />
      </Box>
      <Box>
        <StyledTitleAndText title="Location" text={deviceLocation} />
      </Box>
    </Box>
  );
};
