import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/layout/DesktopTopBar/DesktopTopBar.stories';
import { DesktopTopBarProps } from '../../components/layout/DesktopTopBar/DesktopTopBar';

const { LoggedOut, LoggedIn, WithThemeSwitcher } = composeStories(stories);

describe('DesktopTopBar', () => {
  it('should render LoggedOut', () => {
    const { baseElement, getAllByRole } = render(
      <LoggedOut {...(LoggedOut.args as DesktopTopBarProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getAllByRole('button')).toHaveLength(LoggedOut.args.buttons.length);
    expect(getAllByRole('button')[0]).toHaveTextContent(
      LoggedOut.args.buttons[0].label
    );
    expect(getAllByRole('button')[1]).toHaveTextContent(
      LoggedOut.args.buttons[1].label
    );
  });

  it('should render LoggedIn', () => {
    const { baseElement, getByRole, getAllByRole } = render(
      <LoggedIn {...(LoggedIn.args as DesktopTopBarProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getAllByRole('button')).toHaveLength(LoggedIn.args.buttons.length);
    expect(getByRole('button')).toHaveTextContent(
      LoggedIn.args.buttons[0].label
    );
  });

  it('should render with theme switcher', () => {
    const { baseElement, getAllByRole } = render(
      <WithThemeSwitcher {...(WithThemeSwitcher.args as DesktopTopBarProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getAllByRole('button')).toHaveLength(
      WithThemeSwitcher.args.buttons.length
    );
    expect(WithThemeSwitcher.args.themeSwitcher).toBe(true);
    expect(baseElement.querySelector('.MuiSwitch-input')).toBeInTheDocument();
  });

  it('theme switcher should work', () => {
    const { baseElement } = render(
      <WithThemeSwitcher {...(WithThemeSwitcher.args as DesktopTopBarProps)} />
    );
    fireEvent.click(baseElement.querySelector('.MuiSwitch-input'));
    expect(baseElement.querySelector('.Mui-checked')).toBeInTheDocument();
  });
});
