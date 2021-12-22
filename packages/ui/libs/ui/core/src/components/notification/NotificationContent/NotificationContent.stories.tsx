/* deepscan-disable */
import React from 'react';
import { Meta, Story } from '@storybook/react';
import {
  Title,
  Description,
  Primary,
  ArgsTable,
  PRIMARY_STORY,
  Stories,
} from '@storybook/addon-docs';
import {
  NotificationContent,
  NotificationContentProps,
} from './NotificationContent';
import { NotificationTypeEnum } from '../showNotification';

const description =
  'Custom notification content used for Origin notifications in pair with `react-toastify`';

export default {
  title: 'Notification / NotificationContent',
  component: NotificationContent,
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
} as Meta;

const Template: Story<NotificationContentProps> = (args) => (
  <NotificationContent {...args} />
);

export const Success = Template.bind({});
Success.args = {
  message: 'Some success notification',
  type: NotificationTypeEnum.Success,
};

export const Error = Template.bind({});
Error.args = {
  message: 'Error happened',
  type: NotificationTypeEnum.Error,
};

export const Warning = Template.bind({});
Warning.args = {
  message: 'Warning the user',
  type: NotificationTypeEnum.Warning,
};

export const Info = Template.bind({});
Info.args = {
  message: 'Informing that this is important',
  type: NotificationTypeEnum.Info,
};
