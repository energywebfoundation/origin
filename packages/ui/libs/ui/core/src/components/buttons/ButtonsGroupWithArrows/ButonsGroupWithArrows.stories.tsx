/* deepscan-disable */
import React, { useState } from 'react';
import { Meta, Story } from '@storybook/react';
import { Typography } from '@material-ui/core';
import {
  ButtonsGroupWithArrows,
  ButtonsGroupWithArrowsProps,
} from './ButtonsGroupWithArrows';

export default {
  title: 'Buttons / ButtonsGroupWithArrows',
  component: ButtonsGroupWithArrows,
  argTypes: {
    buttons: {
      type: { required: true },
      description: `Buttons Array of type ButtonGroupItem`,
      table: {
        type: {
          summary: 'ButtonGroupItem',
          detail: '{ label: string, value: T }',
        },
      },
    },
    selected: {
      type: { name: 'any', required: true },
      description: `State variable of button.value type`,
      control: { type: 'text' },
    },
    setSelected: {
      type: { required: true },
      description: `SetState function for changing selected state`,
    },
    onLeftArrowClick: {
      type: { required: true },
      description: `Function for handling Left Arrow click.
      Normally should not be responsible for managing selected state,
      but rather to adjust the data for selected object.`,
    },
    onRightArrowClick: {
      type: { required: true },
      description: `Function for handling Right Arrow click.
      Normally should not be responsible for managing selected state,
      but rather to adjust the data for selected object.`,
    },
  },
  args: {
    buttons: [
      { label: 'One', value: 'one' },
      { label: 'Two', value: 'two' },
      { label: 'Three', value: 'three' },
    ],
    setSelected: (target: string) => alert(`item clicked ${target}`),
    onLeftArrowClick: () => alert('Left arrow clicked'),
    onRightArrowClick: () => alert('Right arrow clicked'),
  },
} as Meta;

const UncontrolledTemplate: Story<ButtonsGroupWithArrowsProps<string>> = (
  args
) => <ButtonsGroupWithArrows {...args} />;

export const Unselected = UncontrolledTemplate.bind({});
Unselected.args = {
  selected: '',
};

export const Selected = UncontrolledTemplate.bind({});
Selected.args = {
  selected: 'one',
};

const ControlledTemplate: Story<ButtonsGroupWithArrowsProps<string>> = (
  args
) => {
  const [selected, setSelected] = useState('');
  return (
    <ButtonsGroupWithArrows
      {...args}
      selected={selected}
      setSelected={setSelected}
    />
  );
};
export const Controlled = ControlledTemplate.bind({});
Controlled.argTypes = {
  ...Controlled.argTypes,
  selected: {
    control: null,
  },
  setSelected: {
    control: null,
  },
};

const FunctionalArrowsTemplate: Story<ButtonsGroupWithArrowsProps<string>> = (
  args
) => {
  const [selected, setSelected] = useState('');
  const [count, setCount] = useState(0);
  const leftArrowClick = () => setCount(count - 1);
  const rightArrowClick = () => setCount(count + 1);
  const selectedButtonLabel = args.buttons.find(
    (button) => button.value === selected
  )?.label;
  const itemText = `Selected item: ${selectedButtonLabel}, count is ${count}`;
  return (
    <div>
      <ButtonsGroupWithArrows
        {...args}
        selected={selected}
        setSelected={setSelected}
        onLeftArrowClick={leftArrowClick}
        onRightArrowClick={rightArrowClick}
      />
      <Typography variant="h5">{itemText}</Typography>
    </div>
  );
};
export const FunctionalArrows = FunctionalArrowsTemplate.bind({});
