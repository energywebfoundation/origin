import { ComposedPublicDevice } from '@energyweb/origin-ui-certificate-data';
import {
  IconText,
  IconTextProps,
  SpecField,
  SpecFieldProps,
} from '@energyweb/origin-ui-core';
import { Box, Button, Card, CardContent } from '@material-ui/core';
import React, { FC } from 'react';
import { useDeviceDetailCardEffects } from './DeviceDetailCard.effects';
import { useStyles } from './DeviceDetailCard.styles';

export interface DeviceDetailCardProps {
  deviceId: ComposedPublicDevice['id'];
  headingIconProps: IconTextProps;
  specFields: SpecFieldProps[];
}

export const DeviceDetailCard: FC<DeviceDetailCardProps> = ({
  headingIconProps,
  specFields,
  deviceId,
}) => {
  const { viewDeviceText, handleViewDevice } =
    useDeviceDetailCardEffects(deviceId);
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <Box py={1} px={2} className={classes.heading}>
        <IconText
          gridContainerProps={{
            direction: 'row-reverse',
            justifyContent: 'space-between',
          }}
          iconProps={{ className: classes.icon }}
          {...headingIconProps}
        />
      </Box>
      <Box width="50%" mx="auto" mt={2}>
        <Button
          fullWidth
          color="inherit"
          onClick={handleViewDevice}
          className={classes.button}
        >
          {viewDeviceText}
        </Button>
      </Box>
      <CardContent>
        {specFields.map((spec) => (
          <SpecField
            key={spec.label}
            wrapperProps={{ className: classes.specWrapper }}
            valueProps={{ className: classes.specValue }}
            {...spec}
          />
        ))}
      </CardContent>
    </Card>
  );
};
