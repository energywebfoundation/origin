/* deepscan-disable */
import React from 'react';
import { Meta, Story } from '@storybook/react';
import {
  Title,
  Description,
  Primary,
  ArgsTable,
  Stories,
  PRIMARY_STORY,
} from '@storybook/addon-docs';
import { StepReport, StepReportProps } from './StepReport';

const description =
  'Component displaying steps passed. Used in MultiStepForm. Has built-in responsive behaviour.';

export default {
  title: 'Form / StepReport',
  component: StepReport,
  parameters: {
    docs: {
      page: () => (
        <>
          <Title />
          <Description>{description}</Description>
          <Primary />
          <ArgsTable story={PRIMARY_STORY} />
          <Stories />
        </>
      ),
    },
  },
} as Meta;

const Template: Story<StepReportProps> = (args) => {
  return <StepReport {...args} />;
};

export const FirstStep = Template.bind({});
FirstStep.args = {
  activeStep: 0,
  labels: ['First step', 'Second step', 'Third step'],
};

export const SecondStep = Template.bind({});
SecondStep.args = {
  activeStep: 1,
  labels: ['First step', 'Second step', 'Third step'],
};

export const ThirdStep = Template.bind({});
ThirdStep.args = {
  activeStep: 2,
  labels: ['First step', 'Second step', 'Third step'],
};
