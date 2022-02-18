import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/layout/TopBar/TopBar.stories';
import { TopBarProps } from '../../components/layout/TopBar/TopBar';

const { LoggedOut, LoggedIn } = composeStories(stories);

describe('TopBar', () => {
  it('should render LoggedOut', () => {
    const { baseElement, getByTestId } = render(
      <LoggedOut {...(LoggedOut.args as TopBarProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getByTestId('MenuIcon')).toBeInTheDocument();
    expect(getByTestId('HowToRegIcon')).toBeInTheDocument();
    expect(getByTestId('AccountCircleIcon')).toBeInTheDocument();
    expect(baseElement.querySelector('.MuiToolbar-root')).toBeInTheDocument();
  });

  it('should render LoggedIn', () => {
    const { baseElement, getByTestId } = render(
      <LoggedIn {...(LoggedIn.args as TopBarProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getByTestId('ExitToAppIcon')).toBeInTheDocument();
  });
});
