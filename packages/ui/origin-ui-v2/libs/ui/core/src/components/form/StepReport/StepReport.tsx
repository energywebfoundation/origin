import { Step, StepLabel, Stepper } from '@material-ui/core';
import React, { FC } from 'react';
import { useStyles } from './StepReport.styles';

export interface StepReportProps {
  activeStep: number;
  labels: string[];
}

export const StepReport: FC<StepReportProps> = ({ labels, activeStep }) => {
  const classes = useStyles();
  return (
    <Stepper className={classes.stepper} activeStep={activeStep}>
      {labels.map((label, index) => {
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
