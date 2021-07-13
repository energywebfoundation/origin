import {
  IconText,
  IconTextProps,
  SpecField,
  SpecFieldProps,
} from '@energyweb/origin-ui-core';
import { Box, Card, CardContent } from '@material-ui/core';
import React, { FC } from 'react';
import { useStyles } from './DeviceDetailCard.styles';

export interface DeviceDetailCardProps {
  headingIconProps: IconTextProps;
  specFields: SpecFieldProps[];
}

export const DeviceDetailCard: FC<DeviceDetailCardProps> = ({
  headingIconProps,
  specFields,
}) => {
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
