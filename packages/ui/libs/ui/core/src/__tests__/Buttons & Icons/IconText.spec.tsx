import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/icons/IconText/IconText.stories';
import { IconTextProps } from '../../components/icons/IconText/IconText';

const { Default, WithSubtitle } = composeStories(stories);

describe('IconText', () => {
  it('should render default IconText', () => {
    const { baseElement, getByText } = render(
      <Default {...(Default.args as IconTextProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getByText(Default.args.title)).toBeInTheDocument();
  });

  it('should render with subtitle', () => {
    const { baseElement, getByText } = render(
      <WithSubtitle {...(WithSubtitle.args as IconTextProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getByText(WithSubtitle.args.title)).toBeInTheDocument();
    expect(getByText(WithSubtitle.args.subtitle)).toBeInTheDocument();
  });
});
