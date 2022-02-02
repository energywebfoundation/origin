import React from 'react';

import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Default, WithTooltip } from './TextWithPendingDot.stories';
import { TextWithPendingDotProps } from './TextWithPendingDot';

describe('TextWithPendingDot', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Default {...(Default.args as TextWithPendingDotProps)} />
    );

    expect(baseElement).toBeInTheDocument();
  });

  it('render child components', () => {
    const { getByText, getByLabelText } = render(
      <WithTooltip {...(WithTooltip.args as TextWithPendingDotProps)} />
    );
    expect(getByText(WithTooltip.args.textContent)).toBeInTheDocument();
    expect(getByLabelText(WithTooltip.args.tooltipText)).toBeInTheDocument();
  });
});
