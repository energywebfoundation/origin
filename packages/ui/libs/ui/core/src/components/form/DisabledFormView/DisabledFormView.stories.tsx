import React from 'react';
import { Meta } from '@storybook/react';
import { DisabledFormView, DisabledFormViewProps } from './DisabledFormView';

export default {
  title: 'Form / DisabledFormView',
  component: DisabledFormView,
} as Meta;

export const Default = (args: DisabledFormViewProps) => {
  return <DisabledFormView {...args} />;
};
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

export const WithHeading = (args: DisabledFormViewProps) => {
  return <DisabledFormView {...args} />;
};
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

export const WithInputProps = (args: DisabledFormViewProps) => {
  return <DisabledFormView {...args} />;
};
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

export const WithHeadingProps = (args: DisabledFormViewProps) => {
  return <DisabledFormView {...args} />;
};
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
