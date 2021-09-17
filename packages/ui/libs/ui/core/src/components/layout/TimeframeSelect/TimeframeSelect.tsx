import React, { FC, ReactNode } from 'react';
import {
  Box,
  BoxProps,
  Grid,
  GridProps,
  Typography,
  TypographyProps,
} from '@material-ui/core';
import { MaterialDatepicker, MaterialDatepickerProps } from '../../form';
import { useStyles } from './TimeframeSelect.styles';

export interface TimeframeSelectProps {
  fromPickerProps: MaterialDatepickerProps;
  toPickerProps: MaterialDatepickerProps;
  title?: string;
  titleProps?: TypographyProps;
  titleWrapperProps?: BoxProps;
  wrapperProps?: BoxProps;
  containerProps?: GridProps;
  pickersContainerProps?: GridProps;
  dividerProps?: BoxProps;
  customDivider?: ReactNode;
}

export const TimeframeSelect: FC<TimeframeSelectProps> = ({
  title,
  fromPickerProps,
  toPickerProps,
  titleProps,
  titleWrapperProps,
  wrapperProps,
  containerProps,
  pickersContainerProps,
  dividerProps,
  customDivider,
}) => {
  const classes = useStyles();

  return (
    <Box className={classes.wrapper} {...wrapperProps}>
      <Grid
        className={classes.frame}
        container
        alignItems="center"
        {...containerProps}
      >
        {title && (
          <Box
            className={classes.titleWrapper}
            display="flex"
            alignItems="center"
            justifyContent="center"
            {...titleWrapperProps}
          >
            <Typography className={classes.title} {...titleProps}>
              {title}
            </Typography>
          </Box>
        )}
        <Grid
          className={classes.dates}
          container
          alignItems="center"
          {...pickersContainerProps}
        >
          <MaterialDatepicker {...fromPickerProps} />

          {customDivider ? (
            customDivider
          ) : (
            <Box className={classes.divider} {...dividerProps} />
          )}

          <MaterialDatepicker {...toPickerProps} />
        </Grid>
      </Grid>
    </Box>
  );
};
