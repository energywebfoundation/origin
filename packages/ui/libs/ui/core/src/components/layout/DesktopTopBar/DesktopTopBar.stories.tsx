import React from 'react';
import { Meta } from '@storybook/react';
import { DesktopTopBar, DesktopTopBarProps } from './DesktopTopBar';

export default {
  title: 'Layout / DesktopTopBar',
  component: DesktopTopBar,
} as Meta;

const loggedOutButtons = [
  {
    label: 'Register',
    onClick: () => {
      console.log('Register clicked');
    },
  },
  {
    label: 'Login',
    onClick: () => {
      console.log('Login clicked');
    },
  },
];
const loggedInButtons = [
  {
    label: 'Logout',
    onClick: () => {
      console.log('Logout clicked');
    },
  },
];

export const LoggedOut = (args: DesktopTopBarProps) => (
  <DesktopTopBar {...args} />
);
LoggedOut.args = {
  buttons: loggedOutButtons,
};

export const LoggedIn = (args: DesktopTopBarProps) => (
  <DesktopTopBar {...args} />
);
LoggedIn.args = {
  buttons: loggedInButtons,
};
