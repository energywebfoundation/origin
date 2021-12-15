/* deepscan-disable */
import React, { useState } from 'react';
import { Meta, Story } from '@storybook/react';
import {
  Title,
  Description,
  Primary,
  ArgsTable,
  PRIMARY_STORY,
} from '@storybook/addon-docs';
import { ThemeModeEnum } from '@energyweb/origin-ui-theme';
import { AccountCircle, ExitToApp, HowToReg } from '@mui/icons-material';
import { MobileTopBar, MobileTopBarProps } from './MobileTopBar';

const description =
  'Topbar for usage on mobile devices with icon-button to open the full navigation menu, additional navigational buttons (login-logout) and an optional theme switch.';

const buttonsDetailType = `{
  label: string;
  Icon: FC;
  onClick: () => void;
  show: boolean;
}`;

export default {
  title: 'Layout / MobileTopBar',
  component: MobileTopBar,
  parameters: {
    docs: {
      page: () => (
        <>
          <Title />
          <Description>{description}</Description>
          <Primary />
          <ArgsTable story={PRIMARY_STORY} />
        </>
      ),
    },
  },
  argTypes: {
    buttons: {
      description: 'An array of button to be displayed',
      table: { type: { detail: buttonsDetailType } },
    },
    onMobileNavOpen: {
      description: 'Function handling the opening of mobile navigation',
      control: false,
    },
    themeSwitcher: {
      description: 'If `true` - will display a switch to change theme mode',
      table: { defaultValue: { summary: false } },
    },
    toolbarClassName: {
      description: 'Class supplied to `Toolbar` component',
      control: false,
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

const Template: Story<MobileTopBarProps> = (args) => <MobileTopBar {...args} />;

const loggedOutButtons = [
  {
    label: 'Register',
    show: true,
    onClick: () => alert('Register clicked'),
    Icon: HowToReg,
  },
  {
    label: 'Login',
    show: true,
    onClick: () => alert('Login clicked'),
    Icon: AccountCircle,
  },
];
const loggedInButtons = [
  {
    label: 'Logout',
    show: true,
    onClick: () => alert('Logout clicked'),
    Icon: ExitToApp,
  },
];

export const LoggedOut = Template.bind({});
LoggedOut.args = {
  buttons: loggedOutButtons,
  onMobileNavOpen: () => alert('open mobile navigation'),
};

export const LoggedIn = Template.bind({});
LoggedIn.args = {
  buttons: loggedInButtons,
  onMobileNavOpen: () => alert('open mobile navigation'),
};

const ThemeTemplate: Story<MobileTopBarProps> = (args) => {
  const [theme, setTheme] = useState(ThemeModeEnum.Dark);

  const changeThemeMode = () => {
    setTheme(
      theme === ThemeModeEnum.Dark ? ThemeModeEnum.Light : ThemeModeEnum.Dark
    );
  };

  return (
    <MobileTopBar
      themeMode={theme}
      changeThemeMode={changeThemeMode}
      {...args}
    />
  );
};

export const WithThemeSwitcher = ThemeTemplate.bind({});
WithThemeSwitcher.args = {
  buttons: loggedOutButtons,
  onMobileNavOpen: () => alert('open mobile navigation'),
  themeSwitcher: true,
};
