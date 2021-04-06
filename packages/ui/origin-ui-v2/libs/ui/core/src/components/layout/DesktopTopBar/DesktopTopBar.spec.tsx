import React from 'react';

import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { LoggedIn, LoggedOut } from './DesktopTopBar.stories';

describe('DesktopTopBar', () => {
  it('render top bar for user that is logged in', () => {
    const { container } = render(<LoggedIn {...LoggedIn.args} />);
    const button = container.querySelector('button');

    expect(button).toBeInTheDocument();
    expect(button.querySelector('span')).toHaveTextContent(
      LoggedIn.args.buttons[0].label
    );
  });

  it('render top bar for user that is logged out', () => {
    const { container } = render(<LoggedOut {...LoggedOut.args} />);
    const buttons = container.querySelectorAll('button');

    expect(buttons[0]).toBeInTheDocument();
    expect(buttons[0].querySelector('span')).toHaveTextContent(
      LoggedOut.args.buttons[0].label
    );
    expect(buttons[1].querySelector('span')).toHaveTextContent(
      LoggedOut.args.buttons[1].label
    );
  });
});
