import React from 'react';
import { Meta } from '@storybook/react';
import { ModalTextContent, ModalTextContentProps } from './ModalTextContent';

export default {
  title: 'Modal / ModalTextContent',
  component: ModalTextContent,
} as Meta;

export const SingleParagraph = (args: ModalTextContentProps) => (
  <ModalTextContent {...args} />
);
SingleParagraph.args = {
  text:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
};

export const MultipleParagraphs = (args: ModalTextContentProps) => (
  <ModalTextContent {...args} />
);
MultipleParagraphs.args = {
  text: [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  ],
};
