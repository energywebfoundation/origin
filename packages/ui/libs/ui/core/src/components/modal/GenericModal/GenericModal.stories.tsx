import React from 'react';
import { Meta } from '@storybook/react';
import { GenericModal, GenericModalProps } from './GenericModal';
import { EmailOutlined } from '@material-ui/icons';

export default {
  title: 'Modal / GenericModal',
  component: GenericModal,
} as Meta;

export const Default = (args: GenericModalProps) => <GenericModal {...args} />;

Default.args = {
  open: true,
  title: 'Test title',
  text: 'Test text content',
  buttons: [{ label: 'Ok', onClick: () => console.log('Ok') }],
};

export const WithTwoParagraphs = (args: GenericModalProps) => (
  <GenericModal {...args} />
);

WithTwoParagraphs.args = {
  open: true,
  title: 'Test title',
  text: ['First test text paragraph', 'Second test text paragraph'],
  buttons: [{ label: 'Ok', onClick: () => console.log('Ok') }],
};

export const WithTwoDifferentButtons = (args: GenericModalProps) => (
  <GenericModal {...args} />
);

WithTwoDifferentButtons.args = {
  open: true,
  title: 'Test title',
  text: 'Test text content',
  buttons: [
    {
      label: 'Not now',
      onClick: () => console.log('Not now'),
      variant: 'outlined' as any,
      color: 'secondary' as any,
    },
    { label: 'Ok', onClick: () => console.log('Ok') },
  ],
};

export const WithIcon = (args: GenericModalProps) => <GenericModal {...args} />;

WithIcon.args = {
  open: true,
  title: 'Test title',
  text: ['First test text paragraph', 'Second test text paragraph'],
  icon: <EmailOutlined color="primary" fontSize="large" />,
  buttons: [{ label: 'Ok', onClick: () => console.log('Ok') }],
};
