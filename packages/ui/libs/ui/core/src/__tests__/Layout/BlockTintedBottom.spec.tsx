import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/layout/BlockTintedBottom/BlockTintedBottom.stories';
import { BlockTintedBottomProps } from '../../components/layout/BlockTintedBottom/BlockTintedBottom';

const { Default } = composeStories(stories);

describe('BlockTintedBottom', () => {
  it('should render default BlockTintedBottom', () => {
    const { baseElement } = render(
      <Default {...(Default.args as BlockTintedBottomProps)} />
    );
    expect(baseElement).toBeInTheDocument();
  });
});
