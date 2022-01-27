import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/layout/ErrorFallback/ErrorFallback.stories';
import { ErrorFallbackProps } from '../../components/layout/ErrorFallback/ErrorFallback';

const { Default, WithTitle, WithButtonsAsChildren } = composeStories(stories);

describe('ErrorFallback', () => {
  it('should render default ErrorFallback', () => {
    const { baseElement } = render(
      <Default {...(Default.args as ErrorFallbackProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelector('p')).toHaveTextContent(
      Default.args.error.message
    );
  });

  it('should render with title', () => {
    const { baseElement } = render(
      <WithTitle {...(WithTitle.args as ErrorFallbackProps)} />
    );
    expect(baseElement.querySelector('h5')).toBeInTheDocument();
    expect(baseElement.querySelector('h5')).toHaveTextContent(
      WithTitle.args.title
    );
    expect(baseElement.querySelector('p')).toHaveTextContent(
      WithTitle.args.error.message
    );
  });

  it('should render with buttons as children', () => {
    const { baseElement, getAllByRole } = render(
      <WithButtonsAsChildren
        {...(WithButtonsAsChildren.args as ErrorFallbackProps)}
      />
    );
    expect(baseElement.querySelector('h5')).toBeInTheDocument();
    expect(baseElement.querySelector('h5')).toHaveTextContent(
      WithButtonsAsChildren.args.title
    );
    expect(baseElement.querySelector('p')).toHaveTextContent(
      WithButtonsAsChildren.args.error.message
    );
    expect(getAllByRole('button')).toHaveLength(2);
  });
});
