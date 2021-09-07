import { IconText, IconTextProps } from '@energyweb/origin-ui-core';
import { ComposedDevice } from '@energyweb/origin-ui-device-data';
import { useTheme } from '@material-ui/core';
import React, { FC } from 'react';
import { useStyles } from './MyDeviceCardContent.styles';

export interface MyDeviceCardContentProps {
  deviceId: ComposedDevice['id'];
  iconsProps: IconTextProps[];
}

export const MyDeviceCardContent: FC<MyDeviceCardContentProps> = ({
  deviceId,
  iconsProps,
}) => {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <div className={classes.contentWrapper}>
      {iconsProps.map((field) => (
        <div className={classes.iconWrapper} key={field.title + deviceId}>
          <IconText
            iconProps={{
              className: classes.deviceIcon,
              width: 40,
              height: 40,
            }}
            gridContainerProps={{
              justifyContent: theme.breakpoints.up('md')
                ? 'center'
                : 'flex-start',
            }}
            {...field}
          />
        </div>
      ))}
    </div>
  );
};
