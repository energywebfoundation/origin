import React from 'react';
import { Meta } from '@storybook/react';
import {
  ButtonsGroupWithArrows,
  ButtonsGroupWithArrowsProps,
} from './ButtonsGroupWithArrows';

export default {
  title: 'Buttons / ButtonsGroupWithArrows',
  component: ButtonsGroupWithArrows,
} as Meta;

export const Default = (args: ButtonsGroupWithArrowsProps) => (
  <ButtonsGroupWithArrows {...args} />
);

Default.args = {
  buttons: [
    { label: 'One', value: 'One' },
    { label: 'Two', value: 'Two' },
    { label: 'Three', value: 'Three' },
  ],
  onLeftArrowClick: () => console.log('Left arrow clicked'),
  onRightArrowClick: () => console.log('Right arrow clicked'),
};
