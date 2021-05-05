import {
  Step,
  StepLabel,
  Stepper,
  Theme,
  useMediaQuery,
} from '@material-ui/core';
import React, { FC } from 'react';
import { useStyles } from './StepReport.styles';

export interface StepReportProps {
  activeStep: number;
  labels: string[];
}

export const StepReport: FC<StepReportProps> = ({ labels, activeStep }) => {
  const classes = useStyles();
  const smallScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm')
  );
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
