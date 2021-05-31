import React, { useState } from 'react';
import { Meta } from '@storybook/react';
import { HorizontalCard, HorizontalCardProps } from './HorizontalCard';
import { Typography } from '@material-ui/core';
import { WindSelected } from '@energyweb/origin-ui-assets';

export default {
  title: 'Card / HorizontalCard',
  component: HorizontalCard,
} as Meta;

export const DefaultWithImage = (args: HorizontalCardProps) => {
  return <HorizontalCard {...args} />;
};

DefaultWithImage.args = {
  onClick: () => console.log('card clicked'),
  selected: false,
  header: <Typography variant="h5">Header</Typography>,
  content: <Typography>Content</Typography>,
  imageUrl:
    'https://energyweb.org/wp-content/uploads/2020/04/red-zeppelin-UVGE-o757-g-unsplash-1080sq.jpg',
};

export const WithFallbackIcon = (args: HorizontalCardProps) => {
  return <HorizontalCard {...args} />;
};

WithFallbackIcon.args = {
  onClick: () => console.log('card clicked'),
  selected: false,
  header: <Typography variant="h5">Header</Typography>,
  content: <Typography>Content</Typography>,
  fallbackIcon: WindSelected,
  fallbackIconProps: { style: { width: 70 } },
};

export const Selectable = (args: HorizontalCardProps) => {
  const [selected, setSelected] = useState(false);

  return (
    <HorizontalCard
      onClick={() => setSelected(!selected)}
      selected={selected}
      {...args}
    />
  );
};

Selectable.args = {
  header: <Typography variant="h5">Header</Typography>,
  content: <Typography>Content</Typography>,
  imageUrl:
    'https://energyweb.org/wp-content/uploads/2020/04/red-zeppelin-UVGE-o757-g-unsplash-1080sq.jpg',
};
