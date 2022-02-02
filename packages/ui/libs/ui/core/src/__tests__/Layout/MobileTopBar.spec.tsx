import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/layout/MobileTopBar/MobileTopBar.stories';
import { MobileTopBarProps } from '../../components/layout/MobileTopBar/MobileTopBar';

const { LoggedOut, LoggedIn, WithThemeSwitcher } = composeStories(stories);

describe('MobileTopBar', () => {
  it('should render LoggedOut', () => {
    const { baseElement, getByTestId } = render(
      <LoggedOut {...(LoggedOut.args as MobileTopBarProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getByTestId('MenuIcon')).toBeInTheDocument();
    expect(getByTestId('HowToRegIcon')).toBeInTheDocument();
    expect(getByTestId('AccountCircleIcon')).toBeInTheDocument();
    expect(baseElement.querySelector('.MuiToolbar-root')).toBeInTheDocument();
  });

  it('should render LoggedIn', () => {
    const { baseElement, getByTestId } = render(
      <LoggedIn {...(LoggedIn.args as MobileTopBarProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getByTestId('ExitToAppIcon')).toBeInTheDocument();
  });

  it('should render with theme switcher', () => {
    const { baseElement, getByTestId } = render(
      <WithThemeSwitcher {...(WithThemeSwitcher.args as MobileTopBarProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getByTestId('MenuIcon')).toBeInTheDocument();
    expect(getByTestId('HowToRegIcon')).toBeInTheDocument();
    expect(getByTestId('AccountCircleIcon')).toBeInTheDocument();
    expect(WithThemeSwitcher.args.themeSwitcher).toBe(true);
    expect(baseElement.querySelector('.MuiSwitch-input')).toBeInTheDocument();
  });

  it('theme switcher should work', async () => {
    const { baseElement } = render(
      <WithThemeSwitcher {...(WithThemeSwitcher.args as MobileTopBarProps)} />
    );
    fireEvent.click(baseElement.querySelector('.MuiSwitch-input'));
    expect(baseElement.querySelector('.Mui-checked')).toBeInTheDocument();
  });
});
