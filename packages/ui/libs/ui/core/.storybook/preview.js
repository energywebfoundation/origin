import React from 'react';
import { addDecorator } from '@storybook/react';
import { MemoryRouter } from 'react-router';
import { makeOriginUiTheme, ThemeModeEnum } from '@energyweb/origin-ui-theme';
import { ThemeProvider } from '@mui/material/styles';
import StyledEngineProvider from '@mui/material/StyledEngineProvider';
import { ThemeProvider as EmotionThemeProvider } from 'emotion-theming';

const originTheme = makeOriginUiTheme({ themeMode: ThemeModeEnum.Dark });

export const OriginThemeProvider = ({ children }) => {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={originTheme}>{children}</ThemeProvider>
    </StyledEngineProvider>
  );
};

addDecorator((story) => (
  <EmotionThemeProvider theme={originTheme}>
    <OriginThemeProvider>{story()}</OriginThemeProvider>
  </EmotionThemeProvider>
));

addDecorator((story) => (
  <MemoryRouter initialEntries={['/']}>{story()}</MemoryRouter>
));

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
