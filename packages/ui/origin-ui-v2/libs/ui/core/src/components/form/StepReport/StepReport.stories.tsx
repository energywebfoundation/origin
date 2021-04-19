import React from 'react';
import { Meta } from '@storybook/react';
import { StepReport, StepReportProps } from './StepReport';

export default {
  title: 'Form / StepReport',
  component: StepReport,
} as Meta;

export const FirstStepDone = (args: StepReportProps) => {
  return <StepReport {...args} />;
};
FirstStepDone.args = {
  activeStep: 0,
  labels: ['First step', 'Second step', 'Third step'],
};

export const SecondStepDone = (args: StepReportProps) => {
  return <StepReport {...args} />;
};
SecondStepDone.args = {
  activeStep: 1,
  labels: ['First step', 'Second step', 'Third step'],
};

export const ThirdStepDone = (args: StepReportProps) => {
  return <StepReport {...args} />;
};
ThirdStepDone.args = {
  activeStep: 2,
  labels: ['First step', 'Second step', 'Third step'],
};
