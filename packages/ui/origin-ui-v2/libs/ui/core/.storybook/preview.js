import { addDecorator } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import { MemoryRouter } from 'react-router';
import {
  EmotionThemeProvider,
  OriginThemeProvider,
} from '@energyweb/origin-ui-theme';

addDecorator(withKnobs);
addDecorator((story) => (
  <MemoryRouter initialEntries={['/']}>{story()}</MemoryRouter>
));
addDecorator((story) => <OriginThemeProvider>{story()}</OriginThemeProvider>);
addDecorator((story) => <EmotionThemeProvider>{story()}</EmotionThemeProvider>);

export const parameters = {
  backgrounds: {
    default: 'dark',
    values: [
      {
        name: 'dark',
        value: '#333333',
      },
      {
        name: 'light',
        value: '#ffffff',
      },
    ],
  },
};
