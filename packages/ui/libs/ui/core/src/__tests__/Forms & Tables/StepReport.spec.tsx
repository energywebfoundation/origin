import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/form/StepReport/StepReport.stories';
import { StepReportProps } from '../../components/form/StepReport/StepReport';

const { FirstStep, SecondStep, ThirdStep } = composeStories(stories);

describe('StepReport', () => {
  it('should render StepReport with first step', () => {
    const { baseElement } = render(
      <FirstStep {...(FirstStep.args as StepReportProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(
      baseElement.querySelector('.MuiStepLabel-label.Mui-active')
    ).toHaveTextContent(FirstStep.args.labels[FirstStep.args.activeStep]);
  });

  it('should render StepReport with second step', () => {
    const { baseElement, getAllByTestId } = render(
      <SecondStep {...(SecondStep.args as StepReportProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getAllByTestId('CheckCircleIcon')).toHaveLength(1);
    expect(
      baseElement.querySelector('.MuiStepLabel-label.Mui-active')
    ).toHaveTextContent(SecondStep.args.labels[SecondStep.args.activeStep]);
  });

  it('should render StepReport with third step', () => {
    const { baseElement, getAllByTestId } = render(
      <ThirdStep {...(ThirdStep.args as StepReportProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getAllByTestId('CheckCircleIcon')).toHaveLength(2);
    expect(
      baseElement.querySelector('.MuiStepLabel-label.Mui-active')
    ).toHaveTextContent(ThirdStep.args.labels[ThirdStep.args.activeStep]);
  });
});
