import React from 'react';
import { render } from '@testing-library/react';
import { IconSize } from './IconPopover';
// import { Default } from './IconPopover.stories';

import * as stories from './IconPopover.stories';

import { composeStories } from '@storybook/testing-react';

const { Default } = composeStories(stories);

import { Info } from '@mui/icons-material';

describe('IconPopover', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Default
        iconSize={IconSize.Large}
        icon={Info}
        popoverText={['This is popover text', 'Which is multiline']}
      />
    );
    expect(baseElement).toBeTruthy();
  });

  it('should match snapshot', () => {
    const { baseElement } = render(
      <Default
        iconSize={IconSize.Large}
        icon={Info}
        popoverText={['This is popover text', 'Which is multiline']}
      />
    );
    expect(baseElement).toMatchSnapshot();
  });
});
