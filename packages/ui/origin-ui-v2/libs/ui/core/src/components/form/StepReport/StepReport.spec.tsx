import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { FirstStepDone } from './StepReport.stories';

describe('StepReport', () => {
  it('should render StepReport with first step', () => {
    const { baseElement } = render(<FirstStepDone {...FirstStepDone.args} />);
    expect(baseElement).toBeInTheDocument();
  });
});
