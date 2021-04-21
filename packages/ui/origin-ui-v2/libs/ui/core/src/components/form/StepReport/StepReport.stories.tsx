import React from 'react';
import { Meta } from '@storybook/react';
import { StepReport, StepReportProps } from './StepReport';

export default {
  title: 'Form / StepReport',
  component: StepReport,
} as Meta;

export const FirstStep = (args: StepReportProps) => {
  return <StepReport {...args} />;
};
FirstStep.args = {
  activeStep: 0,
  labels: ['First step', 'Second step', 'Third step'],
};

export const SecondStep = (args: StepReportProps) => {
  return <StepReport {...args} />;
};
SecondStep.args = {
  activeStep: 1,
  labels: ['First step', 'Second step', 'Third step'],
};

export const ThirdStep = (args: StepReportProps) => {
  return <StepReport {...args} />;
};
ThirdStep.args = {
  activeStep: 2,
  labels: ['First step', 'Second step', 'Third step'],
};
