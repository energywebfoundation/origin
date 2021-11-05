import { Step, StepLabel, Stepper, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/styles';
import React, { FC } from 'react';
import { useStyles } from './StepReport.styles';

export interface StepReportProps {
  activeStep: number;
  labels: string[];
}

export const StepReport: FC<StepReportProps> = ({ labels, activeStep }) => {
  const classes = useStyles();
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <Stepper
      alternativeLabel={smallScreen}
      className={classes.stepper}
      activeStep={activeStep}
    >
      {labels.map((label) => {
        const stepProps: { completed?: boolean } = {};
        const labelProps: { optional?: React.ReactNode } = {};
        return (
          <Step key={label} {...stepProps}>
            <StepLabel {...labelProps}>{label}</StepLabel>
          </Step>
        );
      })}
    </Stepper>
  );
};
