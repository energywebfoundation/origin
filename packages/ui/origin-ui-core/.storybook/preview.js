import { addParameters } from '@storybook/react';

addParameters({
  backgrounds: [
    { name: 'default', value: '#333333', default: true },
    { name: 'white', value: '#ffffff' },
  ],
});