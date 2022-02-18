import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/text/SmallTitleWithText/SmallTitleWithText.stories';
import { SmallTitleWithTextProps } from '../../components/text/SmallTitleWithText/SmallTitleWithText';

const { Default, WithTitle } = composeStories(stories);

describe('SmallTitleWithText', () => {
  it('should render default SmallTitleWithText', () => {
    const { baseElement, getByText } = render(
      <Default {...(Default.args as SmallTitleWithTextProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getByText(Default.args.text)).toBeInTheDocument();
  });

  it('should render with title', () => {
    const { baseElement, getByText } = render(
      <WithTitle {...(WithTitle.args as SmallTitleWithTextProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getByText(WithTitle.args.text)).toBeInTheDocument();
    expect(getByText(WithTitle.args.title)).toBeInTheDocument();
  });
});
