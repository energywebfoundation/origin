import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { FirstStep } from './StepReport.stories';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core';

describe('StepReport', () => {
  it('should render StepReport with first step', () => {
    const { baseElement } = render(
      <MuiThemeProvider theme={createMuiTheme()}>
        <FirstStep {...FirstStep.args} />
      </MuiThemeProvider>
    );
    expect(baseElement).toBeInTheDocument();
  });
});
