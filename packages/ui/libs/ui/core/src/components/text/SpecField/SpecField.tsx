import { Typography, TypographyProps } from '@material-ui/core';
import React, { DetailedHTMLProps, FC, HTMLAttributes } from 'react';
import { useStyles } from './SpecField.styles';

export interface SpecFieldProps {
  label: string;
  value: string | number;
  wrapperProps?: DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
  labelProps?: TypographyProps;
  valueProps?: TypographyProps;
}

export const SpecField: FC<SpecFieldProps> = ({
  label,
  value,
  wrapperProps,
  labelProps,
  valueProps,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.wrapper} {...wrapperProps}>
      <Typography className={classes.label} {...labelProps}>
        {label}
      </Typography>
      <Typography className={classes.value} {...valueProps}>
        {value}
      </Typography>
    </div>
  );
};
