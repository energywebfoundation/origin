/* deepscan-disable */
import React, { useState } from 'react';
import { ThemeModeEnum } from '@energyweb/origin-ui-theme';
import { Meta, Story } from '@storybook/react';
import {
  Title,
  Description,
  Primary,
  ArgsTable,
  PRIMARY_STORY,
  Stories,
} from '@storybook/addon-docs';
import { DesktopTopBar, DesktopTopBarProps } from './DesktopTopBar';

const description = `Topbar for usage on desktop screens. Renders supplied buttons, normally navigation ones. Can display an optional theme switch.`;

const buttonsTypeDetail = `{
  label: string;
  onClick: () => void;
  show: boolean;
}`;

export default {
  title: 'Layout / DesktopTopBar',
  component: DesktopTopBar,
  parameters: {
    docs: {
      page: () => (
        <>
          <Title />
          <Description>{description}</Description>
          <Primary />
          <ArgsTable story={PRIMARY_STORY} />
          <Stories />
        </>
      ),
    },
  },
  argTypes: {
    buttons: {
      description: 'Buttons to be displayed',
      table: { type: { detail: buttonsTypeDetail } },
    },
    toolbarClassName: {
      description: 'Class supplied to `Toolbar` component',
      control: false,
    },
    themeSwitcher: {
      description: 'If `true` - will display a switch to change theme mode',
      table: { defaultValue: { summary: false } },
    },
    themeMode: {
      description: 'Current theme mode',
      table: { defaultValue: { summary: ThemeModeEnum.Light } },
      control: {
        type: 'radio',
        options: [ThemeModeEnum.Light, ThemeModeEnum.Dark],
      },
    },
    changeThemeMode: {
      description: 'Function handling theme mode change',
      control: false,
    },
    themeSwitchProps: {
      description: 'Props supplied to `Switch` component',
      control: false,
    },
  },
} as Meta;

const loggedOutButtons = [
  {
    label: 'Register',
    show: true,
    onClick: () => alert('Register clicked'),
  },
  {
    label: 'Login',
    show: true,
    onClick: () => alert('Login clicked'),
  },
];
const loggedInButtons = [
  {
    label: 'Logout',
    show: true,
    onClick: () => alert('Logout clicked'),
  },
];

const Template: Story<DesktopTopBarProps> = (args) => (
  <DesktopTopBar {...args} />
);

export const LoggedOut = Template.bind({});
LoggedOut.args = {
  buttons: loggedOutButtons,
};

export const LoggedIn = Template.bind({});
LoggedIn.args = {
  buttons: loggedInButtons,
};

const ThemeTemplate: Story<DesktopTopBarProps> = (args) => {
  const [theme, setTheme] = useState(ThemeModeEnum.Dark);

  const changeThemeMode = () => {
    setTheme(
      theme === ThemeModeEnum.Dark ? ThemeModeEnum.Light : ThemeModeEnum.Dark
    );
  };

  return (
    <DesktopTopBar
      themeMode={theme}
      changeThemeMode={changeThemeMode}
      {...args}
    />
  );
};

export const WithThemeSwitcher = ThemeTemplate.bind({});
WithThemeSwitcher.args = {
  buttons: loggedOutButtons,
  themeSwitcher: true,
};
