/* deepscan-disable */
import React from 'react';
import { AccountCircle, ExitToApp, HowToReg } from '@mui/icons-material';
import { Meta, Story } from '@storybook/react';
import {
  Title,
  Description,
  Primary,
  ArgsTable,
  PRIMARY_STORY,
  Stories,
} from '@storybook/addon-docs';
import { TopBarProps, TopBar } from './TopBar';
import { ThemeModeEnum } from '@energyweb/origin-ui-theme';

const description =
  'Topbar for usage on both desktop and mobile devices. ' +
  'On desktop renders supplied buttons (normally navigation ones), also can display theme switch.' +
  'On mobile renders icon-button to open the full navigation menu, supplied buttons (normally navigation ones) and an optional theme switch.';

const buttonsDetailType = `{
  label: string;
  Icon: FC;
  onClick: () => void;
  show: boolean;
}`;

export default {
  title: 'Layout / TopBar',
  component: TopBar,
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
      description: 'An array of button to be displayed',
      table: { type: { detail: buttonsDetailType } },
    },
    onMobileNavOpen: {
      description: 'Function handling the opening of mobile navigation',
      control: false,
    },
    toolbarClassName: {
      description: 'Class supplied to `Toolbar` component',
      control: false,
    },
    themeSwitcher: {
      description: 'If `true` - will display a switch to change theme mode',
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

const Template: Story<TopBarProps> = (args) => <TopBar {...args} />;

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
  onMobileNavOpen: () => {
    alert('Mobile nav open');
  },
};

export const LoggedIn = Template.bind({});
LoggedIn.args = {
  buttons: loggedInButtons,
  onMobileNavOpen: () => {
    alert('Mobile nav open');
  },
};
