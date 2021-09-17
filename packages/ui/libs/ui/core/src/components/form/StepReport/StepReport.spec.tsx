import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { FirstStep } from './StepReport.stories';
import { createTheme, ThemeProvider } from '@material-ui/core';

describe('StepReport', () => {
  it('should render StepReport with first step', () => {
    const { baseElement } = render(
      <ThemeProvider theme={createTheme()}>
        <FirstStep {...FirstStep.args} />
      </ThemeProvider>
    );
    expect(baseElement).toBeInTheDocument();
  });
});
