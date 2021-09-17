import React from 'react';
import { render } from '@testing-library/react';

import { IconPopover, IconSize } from './IconPopover';
import { Info } from '@material-ui/icons';

describe('IconPopover', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <IconPopover
        iconSize={IconSize.Large}
        icon={Info}
        popoverText={['This is popover text', 'Which is multiline']}
      />
    );
    expect(baseElement).toBeTruthy();
  });

  it('should match snapshot', () => {
    const { baseElement } = render(
      <IconPopover
        iconSize={IconSize.Large}
        icon={Info}
        popoverText={['This is popover text', 'Which is multiline']}
      />
    );
    expect(baseElement).toMatchSnapshot();
  });
});
