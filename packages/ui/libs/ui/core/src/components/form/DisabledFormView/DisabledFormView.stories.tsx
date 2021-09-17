/* deepscan-disable */
import React from 'react';
import { Meta, Story } from '@storybook/react';
import {
  Title,
  Description,
  Primary,
  ArgsTable,
  Stories,
  PRIMARY_STORY,
} from '@storybook/addon-docs';
import { DisabledFormView, DisabledFormViewProps } from './DisabledFormView';

const description = `
  Component used for displaying data as Form-like component in 2 columns. <br/>
  Built with <a target="_blank" href="https://next.material-ui.com/api/text-field/">TextField<a/> component from Material-UI. <br />
  Has built-in responsive behaviour starting below 1280px screen width - becoming a single column form.
`;

export default {
  title: 'Form / DisabledFormView',
  component: DisabledFormView,
  argTypes: {
    data: {
      type: { required: true },
      description: 'Required prop for building component content',
      table: {
        type: {
          summary: 'DisabledFormData[]',
          detail: `{ label: string; value: string | number }`,
        },
      },
    },
    heading: {
      description: 'Heading for form',
    },
    inputProps: {
      description:
        "Props supplied for each field <br /> <a target='_blank' href='https://next.material-ui.com/api/text-field/#props'>`TextFieldProps`</a>",
      table: { type: false },
    },
    headingProps: {
      description:
        "Props supplied for form heading, which is built with Typography component <br /> <a target='_blank' href='https://next.material-ui.com/api/typography/#props'>`TypographyProps`</a>",
      table: { type: false },
    },
    paperClass: {
      description:
        "Prop supplied to className prop of <a target='_blank' href='https://next.material-ui.com/api/paper/'>`Paper`</a> component wrapping the form",
    },
  },
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

const Template: Story<DisabledFormViewProps> = (args) => (
  <DisabledFormView {...args} />
);

export const Default = Template.bind({});
Default.args = {
  data: [
    { label: 'Title', value: 'Mr' },
    { label: 'First name', value: 'John' },
    { label: 'Last name', value: 'Doe' },
    { label: 'Email', value: 'johndoe@email.com' },
    { label: 'Address', value: "Doe's street 1" },
    { label: 'Phone', value: '+10987654321' },
  ],
};

export const WithHeading = Template.bind({});
WithHeading.args = {
  data: [
    { label: 'Title', value: 'Mr' },
    { label: 'First name', value: 'John' },
    { label: 'Last name', value: 'Doe' },
    { label: 'Email', value: 'johndoe@email.com' },
    { label: 'Address', value: "Doe's street 1" },
    { label: 'Phone', value: '+10987654321' },
  ],
  heading: 'User Profile data',
};

export const WithInputProps = Template.bind({});
WithInputProps.args = {
  data: [
    { label: 'Title', value: 'Mr' },
    { label: 'First name', value: 'John' },
    { label: 'Last name', value: 'Doe' },
    { label: 'Email', value: 'johndoe@email.com' },
    { label: 'Address', value: "Doe's street 1" },
    { label: 'Phone', value: '+10987654321' },
  ],
  inputProps: {
    variant: 'outlined' as any,
  },
};

export const WithHeadingProps = Template.bind({});
WithHeadingProps.args = {
  data: [
    { label: 'Title', value: 'Mr' },
    { label: 'First name', value: 'John' },
    { label: 'Last name', value: 'Doe' },
    { label: 'Email', value: 'johndoe@email.com' },
    { label: 'Address', value: "Doe's street 1" },
    { label: 'Phone', value: '+10987654321' },
  ],
  heading: 'User Profile data',
  headingProps: {
    variant: 'h4' as any,
  },
};
