import React from 'react';
import { addDecorator } from '@storybook/react';
import { MemoryRouter } from 'react-router';
import { makeOriginUiTheme, ThemeModeEnum } from '@energyweb/origin-ui-theme';
import { ThemeProvider } from '@mui/material/styles';
import StyledEngineProvider from '@mui/material/StyledEngineProvider';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';

const originTheme = makeOriginUiTheme({ themeMode: ThemeModeEnum.Dark });

export const OriginThemeProvider = ({ children }) => {
  return <ThemeProvider theme={originTheme}>{children}</ThemeProvider>;
};

addDecorator((story) => (
  <EmotionThemeProvider theme={originTheme}>
    <OriginThemeProvider>{story()}</OriginThemeProvider>
  </EmotionThemeProvider>
));

addDecorator((story) => (
  <MemoryRouter initialEntries={['/']}>{story()}</MemoryRouter>
));

export const decorators = [
  (Story) => (
    <EmotionThemeProvider theme={originTheme}>
      <OriginThemeProvider>{Story()}</OriginThemeProvider>
    </EmotionThemeProvider>
  ),
];

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
