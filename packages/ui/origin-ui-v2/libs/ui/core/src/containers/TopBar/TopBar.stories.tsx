import React from 'react';
import { Meta } from '@storybook/react';
import { TopBarProps, TopBar } from '../../containers';

export default {
  title: 'Containers / TopBar',
  component: TopBar,
} as Meta;

export const LoggedOut = (args: TopBarProps) => <TopBar {...args} />;
export const LoggedIn = (args: TopBarProps) => <TopBar {...args} />;

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

LoggedOut.args = {
  buttons: loggedOutButtons,
  onMobileNavOpen: () => {
    console.log('Mobile nav open');
  },
};

LoggedIn.args = {
  buttons: loggedInButtons,
  onMobileNavOpen: () => {
    console.log('Mobile nav open');
  },
};
