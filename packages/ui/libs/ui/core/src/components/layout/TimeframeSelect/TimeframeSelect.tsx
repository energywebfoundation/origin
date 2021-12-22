import React, { FC, ReactNode } from 'react';
import {
  Box,
  BoxProps,
  Grid,
  GridProps,
  Typography,
  TypographyProps,
} from '@mui/material';
import { MaterialDatepicker, MaterialDatepickerProps } from '../../form';
import { useStyles } from './TimeframeSelect.styles';

export interface TimeframeSelectProps {
  fromPickerProps: MaterialDatepickerProps;
  toPickerProps: MaterialDatepickerProps;
  title?: string;
  titleProps?: TypographyProps;
  titleWrapperProps?: GridProps;
  wrapperProps?: BoxProps;
  containerProps?: GridProps;
  pickersContainerProps?: GridProps;
  dividerProps?: BoxProps;
  customDivider?: ReactNode;
}

export const TimeframeSelect: FC<TimeframeSelectProps> = ({
  fromPickerProps,
  toPickerProps,
  title = '',
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
          <Grid
            className={classes.titleWrapper}
            item
            xs={12}
            md={6}
            {...titleWrapperProps}
          >
            <Typography className={classes.title} {...titleProps}>
              {title}
            </Typography>
          </Grid>
        )}
        <Grid
          className={classes.dates}
          item
          xs={12}
          md={6}
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
