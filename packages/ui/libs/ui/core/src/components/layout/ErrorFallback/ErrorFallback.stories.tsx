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
import { ErrorFallback, ErrorFallbackProps } from './ErrorFallback';
import { Box, Button } from '@mui/material';

const description =
  'Component displaying the `message` property of supplied `error`. ' +
  'Used for passing as `FallbackComponent` to `ErrorBoundary` and catching errors breaking the ui-app. ' +
  'Normally some navigation buttons are also added as `children` to allow user to return to index page or refresh the current page.';

export default {
  title: 'Layout / ErrorFallback',
  component: ErrorFallback,
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
    error: {
      control: false,
    },
    wrapperProps: {
      description:
        'Props supplied to `div` element wrapping the whole component',
      control: false,
    },
    paperProps: {
      description:
        'Props supplied to `Paper` component which hosts title, error message and optional children.',
      table: { type: { summary: 'PaperProps' } },
      control: false,
    },
    titleProps: {
      description:
        'Props supplied to `Typography` component displaying the title',
      table: { type: { summary: 'TypographyProps' } },
      control: false,
    },
    messageProps: {
      description:
        'Props supplied to `Typography` component displaying the error message',
      table: { type: { summary: 'TypographyProps' } },
      control: false,
    },
  },
} as Meta;

const Template: Story<ErrorFallbackProps> = (args) => (
  <ErrorFallback {...args} />
);

export const Default = Template.bind({});
Default.args = {
  error: new Error('Some critical error breaking the app'),
};

export const WithTitle = Template.bind({});
WithTitle.args = {
  error: new Error('Some error breaking the app'),
  title: 'An error was caught:',
};

export const WithButtonsAsChildren = Template.bind({});
WithButtonsAsChildren.args = {
  error: new Error('Some error breaking the app'),
  title: 'An error was caught:',
  children: (
    <Box justifyContent={'center'} display={'flex'} mt={'20px'}>
      <Button
        onClick={() => alert('Return to home page')}
        variant="contained"
        color="primary"
        sx={{ marginRight: '15px' }}
      >
        Return home
      </Button>
      <Button
        onClick={() => alert('Refresh the page')}
        variant="contained"
        color="primary"
      >
        Refresh page
      </Button>
    </Box>
  ),
};
