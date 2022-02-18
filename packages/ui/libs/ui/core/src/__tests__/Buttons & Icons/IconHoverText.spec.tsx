import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WindRegular } from '@energyweb/origin-ui-assets';

import * as stories from '../../components/icons/IconHoverText/IconHoverText.stories';
import { IconHoverTextProps } from '../../components/icons/IconHoverText/IconHoverText';

const { Default, WithHoverText } = composeStories(stories);

describe('IconHoverText', () => {
  it('should render default IconHoverText', () => {
    const { baseElement } = render(
      <Default {...(Default.args as IconHoverTextProps)} />
    );
    expect(baseElement).toBeInTheDocument();
  });

  it('should render with hover text', () => {
    const { baseElement } = render(
      <WithHoverText
        {...(WithHoverText.args as IconHoverTextProps)}
        icon={WindRegular}
      />
    );
    expect(baseElement).toBeInTheDocument();
  });
});
