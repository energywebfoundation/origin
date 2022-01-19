import { IconText, IconTextProps } from '@energyweb/origin-ui-core';
import { ComposedDevice } from '@energyweb/origin-ui-device-data';
import { useMediaQuery } from '@mui/material';
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
  // to skip ts-errors while doing roll-up build of package
  const mdScreenUp = useMediaQuery((theme: any) => theme.breakpoints.up('md'));

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
              justifyContent: mdScreenUp ? 'center' : 'flex-start',
            }}
            {...field}
          />
        </div>
      ))}
    </div>
  );
};
