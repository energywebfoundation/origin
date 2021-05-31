import { SpecField, SpecFieldProps } from '@energyweb/origin-ui-core';
import { Button, Typography, Grid } from '@material-ui/core';
import { ChevronRight } from '@material-ui/icons';
import React from 'react';
import { useMyDeviceCardHeaderEffects } from './MyDeviceCardHeader.effects';
import { useStyles } from './MyDeviceCardHeader.styles';
interface MyDeviceCardHeaderProps {
  deviceName: string;
  buttonText: string;
  buttonLink: string;
  specFieldProps: SpecFieldProps;
}

export const MyDeviceCardHeader: React.FC<MyDeviceCardHeaderProps> = ({
  deviceName,
  buttonText,
  buttonLink,
  specFieldProps,
}) => {
  const clickHandler = useMyDeviceCardHeaderEffects(buttonLink);
  const classes = useStyles();

  return (
    <div className={classes.headerWrapper}>
      <div className={classes.nameBlockWrapper}>
        <Typography variant="h5">{deviceName}</Typography>
        <Button
          color="inherit"
          onClick={clickHandler}
          className={classes.button}
          classes={{ endIcon: classes.buttonEndIcon }}
          endIcon={<ChevronRight fontSize="small" />}
        >
          {buttonText}
        </Button>
      </div>
      <div className={classes.specBlockWrapper}>
        <SpecField
          wrapperProps={{ className: classes.specFieldWrapper }}
          valueProps={{ className: classes.specFieldValue }}
          {...specFieldProps}
        />
      </div>
    </div>
  );
};
