/* deepscan-disable */
import React, { useState } from 'react';
import { Meta, Story } from '@storybook/react';
import {
  Title,
  Description,
  Primary,
  ArgsTable,
  PRIMARY_STORY,
  Stories,
} from '@storybook/addon-docs';
import { Button } from '@mui/material';
import { EmailOutlined } from '@mui/icons-material';
import { GenericModal, GenericModalProps } from './GenericModal';

const description =
  'Component representing the base for creating your custom modals. Built on `Dialog` and related components from MUI.';

const buttonsTypeDetail = `ButtonProps & {
  label: string;
  onClick: () => void;
}`;

export default {
  title: 'Modal / GenericModal',
  component: GenericModal,
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
    title: {
      description: 'Heading inside modal',
    },
    text: {
      description:
        'Main text content. If supplied as array it will have a line-break after each item.',
    },
    buttons: {
      description: 'Buttons to render in `DialogActions`',
      table: { type: { detail: buttonsTypeDetail } },
    },
    closeButton: {
      description:
        'If `true` - CloseButton will be rendered at the top-right corner of modal',
      table: { defaultValue: { summary: false } },
    },
    handleClose: {
      description:
        'Function to handle `open` state change from true to false. If supplied - user will be able to close modal by clicking `Esc` or clicking CloseButton',
    },
    customContent: {
      description: 'React element to be displayed instead of `text`',
      table: { defaultValue: { summary: 'null' } },
      control: false,
    },
    icon: {
      description: 'Icon to be displayed at the right part of modal',
      table: { defaultValue: { summary: 'null' } },
      control: false,
    },
    titleProps: {
      description: 'Props supplied to the `Typography` component of `title`',
      table: { type: { summary: 'TypographyProps' } },
      control: false,
    },
    textProps: {
      description: 'Props supplied to the `Typography` component(s) of `text`',
      table: { type: { summary: 'TypographyProps' } },
      control: false,
    },
    dialogProps: {
      description: 'Props supplied to the `Dialog` component',
      table: { type: { summary: 'DialogProps' } },
      control: false,
    },
    dialogContentProps: {
      description: 'Props supplied to the `DialogContent` component',
      table: { type: { summary: 'DialogContentProps' } },
      control: false,
    },
    dialogActionsProps: {
      description: 'Props supplied to the `DialogActions` component',
      table: { type: { summary: 'DialogActionsProps' } },
      control: false,
    },
  },
} as Meta;

const Template: Story<GenericModalProps> = (args) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div
      style={{
        width: '100%',
        height: '200px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Button variant="contained" onClick={handleOpen}>
        Open modal
      </Button>
      <GenericModal {...args} open={open} handleClose={handleClose} />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  open: false,
  title: 'Test title',
  text: 'Test text content',
  buttons: [{ label: 'Ok', onClick: () => alert('Ok clicked') }],
  closeButton: true,
};

export const WithTwoParagraphs = Template.bind({});
WithTwoParagraphs.args = {
  open: false,
  title: 'Test title',
  text: ['First test text paragraph', 'Second test text paragraph'],
  buttons: [{ label: 'Ok', onClick: () => alert('Ok') }],
  closeButton: true,
};

export const WithTwoButtons = Template.bind({});
WithTwoButtons.args = {
  open: false,
  title: 'Test title',
  text: 'Test text content',
  buttons: [
    {
      label: 'Not now',
      onClick: () => alert('Not now'),
      variant: 'outlined',
      color: 'secondary',
    },
    { label: 'Ok', onClick: () => alert('Ok') },
  ],
  closeButton: true,
};

export const WithIcon = Template.bind({});
WithIcon.args = {
  open: false,
  title: 'Test title',
  text: ['First test text paragraph', 'Second test text paragraph'],
  icon: <EmailOutlined color="primary" fontSize="large" />,
  buttons: [{ label: 'Ok', onClick: () => alert('Ok') }],
  closeButton: true,
};
