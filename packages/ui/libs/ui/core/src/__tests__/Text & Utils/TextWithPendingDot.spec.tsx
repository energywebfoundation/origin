import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/text/TextWithPendingDot/TextWithPendingDot.stories';
import { TextWithPendingDotProps } from '../../components/text/TextWithPendingDot/TextWithPendingDot';

const { Default, Pending, WithTooltip, WithSuccessDot } =
  composeStories(stories);

describe('TextWithPendingDot', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Default {...(Default.args as TextWithPendingDotProps)} />
    );

    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelector('p')).toHaveTextContent(
      Default.args.textContent
    );
  });

  it('should render with pending', () => {
    const { baseElement } = render(
      <Pending {...(Pending.args as TextWithPendingDotProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelector('span')).toBeInTheDocument();
    expect(baseElement.querySelector('span')).toHaveStyle(
      'background-color: rgb(255, 215, 0)'
    );
  });

  it('render child components', () => {
    const { getByText, getByLabelText } = render(
      <WithTooltip {...(WithTooltip.args as TextWithPendingDotProps)} />
    );
    expect(getByText(WithTooltip.args.textContent)).toBeInTheDocument();
    expect(getByLabelText(WithTooltip.args.tooltipText)).toBeInTheDocument();
  });

  it('should render with success dot', () => {
    const { baseElement } = render(
      <WithSuccessDot {...(WithSuccessDot.args as TextWithPendingDotProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelector('span')).toBeInTheDocument();
    expect(baseElement.querySelector('span')).toHaveStyle(
      'background-color: rgb(137, 78, 197)'
    );
  });
});
